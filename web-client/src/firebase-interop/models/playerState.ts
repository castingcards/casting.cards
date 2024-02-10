import {getDoc, setDoc, getDocs} from "firebase/firestore";

import {BaseModel, typedDoc, typedCollection} from "../baseModel";
import {COLLECTION_PATH as GAME_COLLECTION_PATH} from "./game";

// nested collection from Game

export const ALL_CARD_BUCKETS = ["graveyard", "exile", "battlefield", "hand", "library", "land", "commandzone", "scry", "search"] as const;
export type CARD_BUCKETS = typeof ALL_CARD_BUCKETS[number];

export const ALL_COUNTER_LOCATIONS = ["upper-left", "top", "upper-right", "left", "right", "lower-left", "bottom", "lower-right", "middle"] as const;
export type COUNTER_LOCATION = typeof ALL_COUNTER_LOCATIONS[number];

const COLLECTION_PATH = "playerStates";

export type Counter = {
    kind: string;
    count: number;
    placement: COUNTER_LOCATION;
}

export type CardState = {
    id: number;
    scryfallId: string;
    tapped: boolean;
    isCommander: boolean;
    tokenName?: string;
    counters: Array<Counter>;
}

export type Token = {
    name: string;
    abilities: string;
    power: number | undefined;
    toughness: number | undefined;
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
    nextCardId: number = 0;
    cardIds: Array<string> = [];
    poisonCounters: number = 0;
    isReady: boolean = false;

    libraryCards: Array<CardState> = [];
    landCards: Array<CardState> = [];
    handCards: Array<CardState> = [];
    graveyardCards: Array<CardState> = [];
    exileCards: Array<CardState> = [];
    battlefieldCards: Array<CardState> = [];
    commandzoneCards: Array<CardState> = [];
    scryCards: Array<CardState> = [];
    searchCards: Array<CardState> = [];
    searchBucket: CARD_BUCKETS | undefined = undefined;

    tokenDefinitions: Array<Token> = [];

    fromObject(obj: any): PlayerState {
        const playerState = new PlayerState(obj.gameId, obj.playerId);

        playerState.life = obj.life;
        playerState.deckId = obj.deckId;
        playerState.cardIds = obj.cardIds ;
        playerState.poisonCounters = obj.poisonCounters || 0;
        playerState.isReady = obj.isReady || false;

        playerState.handCards = obj.handCards || [];
        playerState.landCards = obj.landCards || [];
        playerState.libraryCards = obj.libraryCards || [];
        playerState.graveyardCards = obj.graveyardCards || [];
        playerState.exileCards = obj.exileCards || [];
        playerState.battlefieldCards = obj.battlefieldCards || [];
        playerState.commandzoneCards = obj.commandzoneCards || [];
        playerState.tokenDefinitions = obj.tokenDefinitions || [];
        playerState.scryCards = obj.scryCards || [];
        playerState.searchCards = obj.searchCards || [];
        playerState.searchBucket = obj.searchBucket || undefined;

        return playerState;
    }
}

export const playerStateDoc = (gameId: string) => typedDoc(`games/${gameId}/${COLLECTION_PATH}/`, PlayerState)

export async function getPlayerState(gameId: string, playerUserId: string): Promise<PlayerState | undefined> {
    if (!gameId) {
      throw new Error("Must have a Game id to load player states");
    }
    if (!playerUserId) {
      throw new Error("Must have a player id to load player states");
    }

    const playerStateDocSnapshot = await getDoc(playerStateDoc(gameId)(playerUserId));
    if (playerStateDocSnapshot.exists()) {
        return playerStateDocSnapshot.data();
    }
    return undefined;
};

export async function getAllPlayerStates(gameId: string): Promise<Array<PlayerState>> {
    if (!gameId) {
      throw new Error("Must have gameId to load player states");
    }

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

export async function getOrCreatePlayerState(gameId: string, playerUserId: string): Promise<PlayerState> {
    let playerState = await getPlayerState(gameId, playerUserId);
    if (!playerState) {
        playerState = new PlayerState(gameId, playerUserId);
        await addPlayerState(gameId, playerUserId, playerState);
    }
    return playerState;
}