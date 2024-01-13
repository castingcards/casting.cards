import {query, where, addDoc} from "firebase/firestore";
import {typedCollection, typedDoc, BaseModel} from "../baseModel";

export type GameStates = "Unstarted" | "Started" | "Finished";

export const COLLECTION_PATH = "games";

export class Game extends BaseModel {
  name: string;
  ownerUserId: string;
  playersId: Array<string> = [];
  maxPlayers: number = 4;
  state: GameStates = "Unstarted";

  constructor(name: string, ownerUserId: string) {
    super();
    this.name = name || "<unknown>";
    this.ownerUserId = ownerUserId;
    this.playersId = [ownerUserId];
    this.state = "Unstarted";
    this.maxPlayers = 4;
  }

  collectionPath(): string {
    return COLLECTION_PATH;;
  }

  withName(name: string) {
    this.name = name;
    return this;
  }

  withOwnerUserID(ownerUserId: string) {
    this.ownerUserId = ownerUserId;
    return this;
  }

  withPlayerIds(playersId: Array<string>) {
    this.playersId = playersId;
    return this;
  }

  withMaxPlayers(maxPlayers: number) {
    this.maxPlayers = maxPlayers;
    return this;
  }

  withState(state: GameStates) {
    this.state = state;
    return this;
  }

  fromObject(obj: any): Game {
    const game = new Game(obj.name, obj.ownerUserId);
    game.playersId = obj.playersId;

    return game;
  }
};

export const gamesCollection = typedCollection(COLLECTION_PATH, Game);
export const gameDoc = typedDoc(COLLECTION_PATH, Game);

export const allGamesQuery = () => query(gamesCollection);
export const myGamesQuery = (userId: string) => query(gamesCollection, where("playersId", "array-contains", userId));

export async function addGame(game: Game): Promise<Game> {
  if (!game.ownerUserId) {
    throw new Error("Must provide a userId");
  }

  try {
    const docReference = await addDoc(gamesCollection, game);
    game.withId(docReference.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }

  return game;
}
