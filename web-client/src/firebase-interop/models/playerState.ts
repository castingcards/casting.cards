import {getDoc, setDoc, getDocs} from "firebase/firestore";

import { Deck } from "./deck";

import { BaseModel, typedDoc, typedCollection } from "../baseModel";
import {COLLECTION_PATH as GAME_COLLECTION_PATH} from "./game";

// nested collection from Game
export const ALL_CARD_BUCKETS = ["graveyard", "exile", "battlefield", "hand", "library", "land"] as const;
export type CARD_BUCKETS = typeof ALL_CARD_BUCKETS[number];
const COLLECTION_PATH = "playerStates";

export type CardState = {
    id: number;
    scryfallId: string;
    tapped: boolean;
}

function newCardState(scryfallId: string, id: number, tapped: boolean = false): CardState {
    return {id, scryfallId, tapped};
}

export class PlayerState extends BaseModel {
    constructor(gameId: string = "", playerId: string = "") {
        super();
        this.gameId = gameId;
        this.playerId = playerId;
    }

    collectionPath(): string {
        if (!this.gameId) {
            throw new Error("Must have a gameId to load player states");
        }
        return `${GAME_COLLECTION_PATH}/${this.gameId}/${COLLECTION_PATH}`;
    }

    gameId: string;
    playerId: string;
    life: number = 40;
    deckId: string = "";
    cardIds: Array<string> = [];
    poisonCounters: number = 0;
    isReady: boolean = false;

    libraryCards: Array<CardState> = [];
    landCards: Array<CardState> = [];
    handCards: Array<CardState> = [];
    graveyardCards: Array<CardState> = [];
    exileCards: Array<CardState> = [];
    battlefieldCards: Array<CardState> = [];

    async chooseDeck(deckId: string) {
        const deck = await Deck.load(deckId);
        if (!deck) {
            throw new Error(`Deck ${deckId} not found`);
        }

        const allCardIds = deck.allCards().map(card => card.id);
        this.deckId = deckId;
        this.cardIds = allCardIds;
        this.isReady = false;

        const cardStates = allCardIds.map((cardId, index) => newCardState(cardId, index));
        this.libraryCards = deck.shuffle(cardStates);
        return this
    }

    drawCard() {
        const drawnCard = this.libraryCards.shift();
        if (drawnCard) {
            this.handCards.push(drawnCard!);
        }
    }

    moveCard(cardId: number, from: CARD_BUCKETS, to: CARD_BUCKETS) {
        let fromCardIndex: number = this[`${from}Cards`].findIndex(card => card.id == cardId);
        const cardToMove = this[`${from}Cards`][fromCardIndex];
        if (fromCardIndex < 0) {
            console.warn(`Card ${cardId} not found in ${from}`);
            return this;
        }

        this[`${from}Cards`].splice(fromCardIndex, 1);
        this[`${to}Cards`] = [...this[`${to}Cards`], cardToMove];
        return this;
    }

    setReady(value: boolean): PlayerState {
      this.isReady = value;
      return this;
    }

    fromObject(obj: any): PlayerState {
        const playerState = new PlayerState(obj.gameId, obj.playerId);
        playerState.life = obj.life;
        playerState.deckId = obj.deckId;
        playerState.cardIds = obj.cardIds;
        playerState.poisonCounters = obj.poisonCounters;
        playerState.isReady = obj.isReady;

        playerState.handCards = obj.handCards;
        playerState.landCards = obj.landCards;
        playerState.libraryCards = obj.libraryCards;
        playerState.graveyardCards = obj.graveyardCards;
        playerState.exileCards = obj.exileCards;
        playerState.battlefieldCards = obj.battlefieldCards;
        return playerState;
    }
}

export const playerStateDoc = (gameId: string) => typedDoc(`games/${gameId}/${COLLECTION_PATH}/`, PlayerState)

export async function getPlayerState(gameId: string, playerUserId: string): Promise<PlayerState | undefined> {
    const playerStateDocSnapshot = await getDoc(playerStateDoc(gameId)(playerUserId));
    if (playerStateDocSnapshot.exists()) {
        return playerStateDocSnapshot.data();
    }
    return undefined;
};

export async function getAllPlayerStates(gameId: string): Promise<Array<PlayerState>> {
    const playerStateCollection = typedCollection(`games/${gameId}/${COLLECTION_PATH}`, PlayerState);
    const playerStateQuerySnapshot = await getDocs(playerStateCollection);
    return playerStateQuerySnapshot.docs.map(doc => doc.data());
}

export async function addPlayerState(gameId: string, playerUserId: string, playerState: PlayerState): Promise<void> {
  try {
    await setDoc(playerStateDoc(gameId)(playerUserId), playerState);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}