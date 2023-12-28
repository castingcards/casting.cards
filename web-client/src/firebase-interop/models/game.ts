import { query, addDoc, setDoc } from "firebase/firestore";
import { typedCollection, typedDoc, BaseModel } from "../baseModel";

export class Game extends BaseModel {
  name: string;
  ownerUserId: string;
  numPlayers: number = 0;
  players: Array<string> = [];
  decks: Array<string> = [];

  constructor(name: string, ownerUserId: string) {
    super();
    this.name = name || "<unknown>";
    this.ownerUserId = ownerUserId;
    this.players = [ownerUserId];
  }

  getDeck(playerId: string) {
    const playerIndex = this.players.indexOf(playerId);
    if (playerIndex > -1) {
        return this.decks[playerIndex];
    } else {
        throw new Error("Player not found");
    }
  }

  withName(name: string) {
    this.name = name;
    return this;
  }

  withOwnerUserID(ownerUserId: string) {
    this.ownerUserId = ownerUserId;
    return this;
  }

  withNumPlayers(numPlayers: number) {
    this.numPlayers = numPlayers;
    return this;
  }

  withPlayers(playerId: string) {
    if (this.players.length <= this.numPlayers) {
        this.players.push(playerId);
    }
    return this;
  }

  withDeck(playerId: string, deckId: string) {
    const playerIndex = this.players.indexOf(playerId);
    if (playerIndex > -1) {
        this.decks[playerIndex] = deckId;
    } else {
        throw new Error("Player not found");
    }
  }

  withDecks(decks: Array<string>) {
    this.decks = decks;
    return this;
  }

  fromObject(obj: any): Game {
    return new Game(obj.name, obj.ownerUserId)
        .withNumPlayers(obj.numPlayers)
        .withPlayers(obj.players)
        .withDecks(obj.decks);
  }
};

export const gamesCollection = typedCollection("games", Game);
export const gameDoc = typedDoc("games", Game);

export const allGamesQuery = () => query(gamesCollection);

export async function addGame(game: Game): Promise<void> {
  if (!game.ownerUserId) {
    throw new Error("Must provide a userId");
  }

  try {
    await addDoc(gamesCollection, game);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function updateGame(gameId: string, game: Game): Promise<void> {
  try {
    await setDoc(gameDoc(gameId), game);
  } catch (e) {
    console.error("Error updating document: ", e);
  }
}
