import {query, addDoc} from "firebase/firestore";
import {typedCollection, typedDoc, BaseModel} from "../baseModel";

import {Deck} from "./deck"

const COLLECTION_PATH = "games";
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

    static fromObject(obj: any): CardPosition {
        const cardPosition = new CardPosition(obj.cardId, obj.x, obj.y, obj.z);
        cardPosition.flipped = obj.flipped;
        return cardPosition;
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
    handCardIds: Array<string> = [];
    poisonCounters: number = 0;

    playedCards: Array<CardPosition> = [];

    async chooseDeck(deckId: string) {
        const deck = await Deck.load(deckId);
        if (!deck) {
            throw new Error(`Deck ${deckId} not found`);
        }

        const allCardIds = deck.allCards().map(card => card.id);
        this.deckId = deckId;
        this.cardIds = allCardIds;
        this.shuffledLibraryCardIds = deck.shuffle(allCardIds);
        return this
    }

    static fromObject(obj: any): PlayerState {
        const playerState = new PlayerState(obj.playerId);
        playerState.life = obj.life;
        playerState.deckId = obj.deckId;
        playerState.cardIds = obj.cardIds;
        playerState.shuffledLibraryCardIds = obj.shuffledLibraryCardIds;
        playerState.poisonCounters = obj.poisonCounters;
        playerState.handCardIds = obj.handCardIds;
        playerState.playedCards = obj.playedCards.map((card: any) => {
            return CardPosition.fromObject(card);
        });
        return playerState;
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
        return PlayerState.fromObject(player);
    });

    return game;
  }
};

export const gamesCollection = typedCollection(COLLECTION_PATH, Game);
export const gameDoc = typedDoc(COLLECTION_PATH, Game);

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
