import { query, where, addDoc, setDoc } from "firebase/firestore";
import { typedCollection, typedDoc } from "../firebaseInit";

import type { Card } from "scryfall-sdk";

export class CardReference {
  count: number;
  scryfallDetails: Card;

  constructor(count: number, scryfallDetails: Card) {
    this.count = count;
    this.scryfallDetails = scryfallDetails;
  }
};

export class Deck {
  name: string;
  cards: Array<CardReference>;
  commanderId: string;

  userId: string;
  source: string;

  constructor(name: string, cards: Array<CardReference>, commanderId: string) {
    this.name = name || "<unknown>";
    this.cards = cards;
    this.commanderId = commanderId;

    this.userId = ""
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

  withCommanderId(commanderId: string) {
    this.commanderId = commanderId;
    return this;
  }
};

export const decksCollection = typedCollection("decks", Deck);
export const deckDoc = typedDoc("decks", Deck);

export const myDecksQuery = (uid: string) => query(decksCollection, where("userId", "==", uid));

export function cardsToShuffle(deck: Deck): Array<any> {
  const cardList: Array<any> = [];
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