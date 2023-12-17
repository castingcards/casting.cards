import {query, where, addDoc, setDoc } from "firebase/firestore";
import {typedCollection, typedDoc} from "../firebaseInit";

import type {Card} from "scryfall-sdk";

export type CardReference = {
    count: number;
    scryfallDetails: Card;
};

export type Deck = {
  uid: string;
  name: string;
  cards: Array<CardReference>;
  importText: string;
  commanderId?: string;
};

export const decksCollection = typedCollection<Deck>("decks");
export const deckDoc = typedDoc<Deck>("decks");

export const myDecksQuery = (uid: string) => query(decksCollection, where("uid", "==", uid));

export function cardsToShuffle(deck: Deck): Array<any> {
    const cardList: Array<any> = [];
    deck.cards.forEach((card) => {
        for (let i = 0; i < card.count; i++) {
            cardList.push(card.scryfallDetails);
        }
    });
    return cardList;
}

// TODO: I'm not sure we need these functions anymore. Clean this up
export async function addDeck(deck: Deck): Promise<void> {
    try {
        await addDoc(decksCollection, deck);
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