import {query, where, addDoc} from "firebase/firestore";
import {typedCollection, typedDoc, BaseModel} from "../baseModel";

import {Deck} from "./deck"

type CARD_BUCKETS = "graveyard" | "exile" | "battlefield" | "hand" | "library";
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
    poisonCounters: number = 0;
    isReady: boolean = false;
    playedCards: Array<CardPosition> = [];

    libraryCardIds: Array<string> = [];
    handCardIds: Array<string> = [];
    graveyardCardIds: Array<string> = [];
    exileCardIds: Array<string> = [];
    battlefieldCardIds: Array<string> = [];

    async chooseDeck(deckId: string) {
        const deck = await Deck.load(deckId);
        if (!deck) {
            throw new Error(`Deck ${deckId} not found`);
        }

        const allCardIds = deck.allCards().map(card => card.id);
        this.deckId = deckId;
        this.cardIds = allCardIds;
        this.isReady = false;

        this.libraryCardIds = deck.shuffle(allCardIds);
        return this
    }

    drawCard() {
        const drawnCard = this.libraryCardIds.shift();
        if (drawnCard) {
            this.handCardIds.push(drawnCard!);
        }
    }

    moveCard(cardId: string, from: CARD_BUCKETS, to: CARD_BUCKETS) {
      let fromCardIndex: number = this[`${from}CardIds`].indexOf(cardId);
      if (!fromCardIndex) {
        console.warn(`Card ${cardId} not found in ${from}`);
        return this;
      }

      this[`${from}CardIds`] = [...this[`${from}CardIds`]].splice(fromCardIndex, 1);
      this[`${to}CardIds`] = [...this[`${to}CardIds`], cardId];
      return this;
    }

    setReady(value: boolean): PlayerState {
      this.isReady = value;
      return this;
    }

    static fromObject(obj: any): PlayerState {
        const playerState = new PlayerState(obj.playerId);
        playerState.life = obj.life;
        playerState.deckId = obj.deckId;
        playerState.cardIds = obj.cardIds;
        playerState.poisonCounters = obj.poisonCounters;
        playerState.isReady = obj.isReady;

        playerState.handCardIds = obj.handCardIds;
        playerState.libraryCardIds = obj.libraryCardIds;
        playerState.graveyardCardIds = obj.graveyardCardIds;
        playerState.exileCardIds = obj.exileCardIds;
        playerState.battlefieldCardIds = obj.battlefieldCardIds;

        playerState.playedCards = obj.playedCards.map((card: any) => {
            return CardPosition.fromObject(card);
        });
        return playerState;
    }
}

export class Game extends BaseModel {
  name: string;
  ownerUserId: string;
  players: Array<PlayerState> = [];
  playersId: Array<string> = [];
  maxPlayers: number = 4;
  state: "Unstarted" | "Started" | "Finihed" = "Unstarted";

  constructor(name: string, ownerUserId: string) {
    super();
    this.name = name || "<unknown>";
    this.ownerUserId = ownerUserId;
    this.players = [new PlayerState(ownerUserId)];
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

  getPlayerState(playerId: string): PlayerState | undefined {
    return this.players.find((player) => {
        return player.playerId === playerId;
    });
  }

  movePlayerCardTo(userId: string, cardId: string, from: CARD_BUCKETS, to: CARD_BUCKETS) {
    this.getPlayerState(userId)?.moveCard(cardId, from, to);
    return this;
  }

  addPlayerId(userId: string): Game {
    if (this.state === "Finihed") {
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
    if (this.state === "Finihed") {
      throw new Error("Game is done.")
    }
    if (this.state === "Started") {
      throw new Error("Game is in progress.");
    }

    let state = this.getPlayerState(userId);
    if (!state) {
      state = new PlayerState(userId);
      this.players = [...this.players, state];
    }

    if (deckId) {
      await state.chooseDeck(deckId);
    }

    return this.addPlayerId(userId);
  }

  playerIsReady(userId: string): Game {
    if (this.state === "Finihed") {
      throw new Error("Game is done.")
    }
    if (this.state === "Started") {
      throw new Error("Game is in progress.");
    }

    let playerState = this.getPlayerState(userId);
    if (!playerState) {
      throw new Error("Must select a deck first");
    }

    playerState.setReady(true);
    this.state = this.players.every(p => p.isReady) ? "Started" : "Unstarted";
    return this;
  }

  isGameFull(): boolean {
    return this.playersId.length < this.maxPlayers;
  }

  fromObject(obj: any): Game {
    const game = new Game(obj.name, obj.ownerUserId);
    game.playersId = obj.playersId;

    game.players = obj.players.map((player: any) => {
        return PlayerState.fromObject(player);
    });

    return game;
  }
};

export const gamesCollection = typedCollection(COLLECTION_PATH, Game);
export const gameDoc = typedDoc(COLLECTION_PATH, Game);

export const allGamesQuery = () => query(gamesCollection);
export const myGamesQuery = (userId: string) => query(gamesCollection, where("playersId", "array-contains", userId));

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
