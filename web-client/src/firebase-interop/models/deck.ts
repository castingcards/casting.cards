import { query, where, addDoc, setDoc } from "firebase/firestore";
import { BaseModel, typedCollection, typedDoc } from "../baseModel";

import type { Card } from "scryfall-sdk";

export class CardReference {
  count: number;
  scryfallDetails: Card;
  isCommander: boolean;

  constructor(count: number, scryfallDetails: Card, isCommander: boolean = false) {
    this.count = count;
    this.scryfallDetails = scryfallDetails;
    this.isCommander = isCommander;
  }

  canBeCommander(): boolean {
    if (this.scryfallDetails.legalities.commander !== "legal") {
        return false;
    }

    if (this.scryfallDetails.type_line.includes("Legendary Creature")) {
        return true;
    }

    if (this.scryfallDetails.oracle_text?.toLowerCase().includes("can be your commander")) {
        return true;
    }

    return false;
  }
};

export class Deck extends BaseModel {
  name: string;
  cards: Array<CardReference>;

  userId: string;
  source: string;

  constructor(name: string, cards: Array<CardReference> = []) {
    super();

    this.name = name || "<unknown>";
    this.cards = cards;

    this.userId = "";
    this.source = "";
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

    return new Deck(obj.name, obj.cards)
      .withCardReferences(cardReferences)
      .withSource(obj.source)
      .withUserID(obj.userId);
  }
};

export const decksCollection = typedCollection("decks", Deck);
export const deckDoc = typedDoc("decks", Deck);

export const myDecksQuery = (uid: string) => query(decksCollection, where("userId", "==", uid));

export function cardsToShuffle(deck: Deck): Array<Card> {
  const cardList: Array<Card> = [];
  deck.cards.forEach((card) => {
    for (let i = 0; i < card.count; i++) {
      cardList.push(card.scryfallDetails);
    }
  });
  return cardList;
}

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

export async function updateDeck(deckId: string, deck: Deck): Promise<void> {
  try {
    await setDoc(deckDoc(deckId), deck);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
