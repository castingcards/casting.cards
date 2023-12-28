import { query, addDoc, setDoc } from "firebase/firestore";
import { typedCollection, typedDoc, BaseModel } from "../baseModel";

import type { Deck } from "./deck";
export class CardPosition {
    constructor(cardId: string, x: number, y: number, z: number = 0) {
        this.cardId = cardId;
        this.x = x;
        this.y = y;
        this.z = z;
    }
    cardId: string;
    x: number;
    y: number;
    z: number = 0;
    flipped: boolean = false;

    fromObject(obj: any): CardPosition {
        this.z = obj.z;
        this.flipped = obj.flipped;
        return this;
    }
}

export class PlayerState {
    constructor(playerId: string) {
        this.playerId = playerId;
    }

    playerId: string;
    life: number = 40;
    deckId: string = "";
    cardIds: Array<string> = [];
    shuffledLibraryCardIds: Array<string> = [];
    poisonCounters: number = 0;

    playedCards: Array<CardPosition> = [];

    withDeck(deckId: string, deck: Deck) {
        this.deckId = deckId;
        const allCardIds = deck.allCards().map(card => card.id);
        this.cardIds = allCardIds;
        this.shuffledLibraryCardIds = deck.shuffle(allCardIds);
        return this
    }

    fromObject(obj: any): PlayerState {
        this.life = obj.life;
        this.deckId = obj.deckId;
        this.cardIds = obj.cardIds;
        this.shuffledLibraryCardIds = obj.shuffledLibraryCardIds;
        this.poisonCounters = obj.poisonCounters;
        this.playedCards = obj.playedCards.map((card: any) => {
            const cardPosition = new CardPosition(card.cardId, card.x, card.y);
            cardPosition.fromObject(card);
            return cardPosition;
        });
        return this;
    }
}

export class Game extends BaseModel {
  name: string;
  ownerUserId: string;
  numPlayers: number = 0;
  players: Array<PlayerState> = [];

  constructor(name: string, ownerUserId: string) {
    super();
    this.name = name || "<unknown>";
    this.ownerUserId = ownerUserId;
    this.players = [new PlayerState(ownerUserId)];
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

  getPlayer(playerId: string): PlayerState {
    const player = this.players.find((player) => {
        return player.playerId === playerId;
    });

    if (!player) {
        throw new Error(`Player ${playerId} not found in game ${this.name}`);
    }

    return player;
  }

  fromObject(obj: any): Game {
    const game = new Game(obj.name, obj.ownerUserId)
        .withNumPlayers(obj.numPlayers);

    game.players = obj.players.map((player: any) => {
        const playerState = new PlayerState(player.playerId);
        playerState.fromObject(player);
        return playerState;
    });

    return game;
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
