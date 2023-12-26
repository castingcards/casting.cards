import { query, addDoc } from "firebase/firestore";
import { typedCollection, typedDoc, BaseModel } from "../baseModel";

export class Game extends BaseModel {
  name: string;
  ownerUserId: string;

  constructor(name: string, ownerUserId?: string) {
    super();
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

  fromObject(obj: any): Game {
    return new Game(obj.name, obj.ownerUserId);
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
