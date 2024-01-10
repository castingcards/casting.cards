import {query, where, addDoc} from "firebase/firestore";
import {typedCollection, typedDoc, BaseModel} from "../baseModel";

import {PlayerState, getPlayerState, getAllPlayerStates, addPlayerState} from "./playerState";
import type {CARD_BUCKETS} from "./playerState";

export const COLLECTION_PATH = "games";

export class Game extends BaseModel {
  name: string;
  ownerUserId: string;
  playersId: Array<string> = [];
  maxPlayers: number = 4;
  state: "Unstarted" | "Started" | "Finished" = "Unstarted";

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

  async getPlayerState(playerId: string): Promise<PlayerState | undefined> {
    if (!this.id) {
      throw new Error("Must have an id to load player states");
    }
    return getPlayerState(this.id, playerId);
  }

  async getAllPlayerStates(): Promise<Array<PlayerState>> {
    if (!this.id) {
      throw new Error("Must have an id to load player states");
    }

    return getAllPlayerStates(this.id);
  }

  async movePlayerCardTo(userId: string, cardId: number, from: CARD_BUCKETS, to: CARD_BUCKETS) {
    const playerState = await this.getPlayerState(userId);
    if (playerState) {
        playerState.moveCard(cardId, from, to);
    }

    return this;
  }

  addPlayerId(userId: string): Game {
    if (this.state === "Finished") {
      throw new Error("Game is done.")
    }
    if (this.state === "Started") {
      throw new Error("Game is in progress.");
    }

    if (this.playersId.indexOf(userId) === -1) {
      if (this.playersId.length >= this.maxPlayers) {
        throw new Error(`Can't add more player. Max is ${this.maxPlayers}.`);
      }

      this.playersId = [...this.playersId, userId];
    }
    return this;
  }

  async setDeckForPlayer(userId: string, deckId: string): Promise<Game> {
    if (this.state === "Finished") {
      throw new Error("Game is done.")
    }
    if (this.state === "Started") {
      throw new Error("Game is in progress.");
    }

    console.log("Setting deck for player", userId, deckId)

    let state = await this.getPlayerState(userId);
    if (!state) {
      state = new PlayerState(this.id, userId);
      await addPlayerState(this.id!, userId, state);
    }

    if (deckId) {
      await state.chooseDeck(deckId);
      await state.save();
    }

    return this.addPlayerId(userId);
  }

  async playerIsReady(userId: string): Promise<Game> {
    if (this.state === "Finished") {
      throw new Error("Game is done.")
    }
    if (this.state === "Started") {
      throw new Error("Game is in progress.");
    }

    let playerState = await this.getPlayerState(userId);
    if (!playerState) {
      throw new Error("Must select a deck first");
    }

    playerState.setReady(true);
    playerState.save();

    const allPlayerStates = await this.getAllPlayerStates();
    this.state = allPlayerStates.every(p => p.isReady) ? "Started" : "Unstarted";
    return this;
  }

  isGameFull(): boolean {
    return this.playersId.length < this.maxPlayers;
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
