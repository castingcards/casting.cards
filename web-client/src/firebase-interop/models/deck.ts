import {query, where, addDoc} from "firebase/firestore";
import {BaseModel, typedCollection, typedDoc} from "../baseModel";

import type { Card } from "scryfall-sdk";

const COLLECTION_PATH = "decks";

export class CardReference {
  count: number;
  scryfallDetails: Card;
  isCommander: boolean;

  constructor(count: number, scryfallDetails: Card, isCommander: boolean = false) {
    this.count = count;
    this.scryfallDetails = scryfallDetails;
    this.isCommander = isCommander;
  }
};

export class Deck extends BaseModel {
  name: string;
  cards: Array<CardReference>;

  userId: string;
  source: string;

  constructor(name: string = "<unknown>", cards: Array<CardReference> = []) {
    super();

    this.name = name;
    this.cards = cards;

    this.userId = "";
    this.source = "";
  }

  collectionPath(): string {
    return COLLECTION_PATH;;
  }

  withName(name: string) {
    this.name = name;
    return this;
  }

  withUserID(userId: string) {
    this.userId = userId;
    return this;
  }

  withSource(source: string) {
    this.source = source;
    return this;
  }

  withCardReferences(cards: Array<CardReference>) {
    this.cards = cards;
    return this;
  }

  fromObject(obj: any): Deck {
    const cardReferences = obj.cards.map((card: any) => {
      return new CardReference(card.count, card.scryfallDetails, card.isCommander);
    });

    return new Deck(obj.name, [])
      .withCardReferences(cardReferences)
      .withSource(obj.source)
      .withUserID(obj.userId);
  }
};

export const decksCollection = typedCollection(COLLECTION_PATH, Deck);
export const deckDoc = typedDoc(COLLECTION_PATH, Deck);

export const myDecksQuery = (userId: string) => query(decksCollection, where("userId", "==", userId));
export async function addDeck(userId: string, deck: Deck): Promise<void> {
  if (!userId) {
    throw new Error("Must provide a userId");
  }

  try {
    await addDoc(decksCollection, deck.withUserID(userId));
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
