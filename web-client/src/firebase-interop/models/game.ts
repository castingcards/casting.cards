import { query, where, addDoc, setDoc } from "firebase/firestore";
import { typedCollection, typedDoc } from "../firebaseInit";

export class Game {
  name: string;
  ownerUserId: string;

  constructor(name: string, ownerUserId?: string) {
    this.name = name || "<unknown>";
    this.ownerUserId = ownerUserId || "<unknown>";
  }

  withName(name: string) {
    this.name = name;
    return this;
  }

  withOwnerUserID(ownerUserId: string) {
    this.ownerUserId = ownerUserId;
    return this;
  }
};

export const gamesCollection = typedCollection("games", Game);
export const gameDoc = typedDoc("games", Game);

export const allGamesQuery = () => query(gamesCollection);

export async function addGame(userId: string, game: Game): Promise<void> {
  if (!userId) {
    throw new Error("Must provide a userId");
  }

  try {
    await addDoc(gamesCollection, game.withOwnerUserID(userId));
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
