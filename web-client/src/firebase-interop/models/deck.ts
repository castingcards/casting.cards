import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import {db} from "../firebaseInit";

import type {Card} from "scryfall-sdk";

export type CardReference = {
    count: number;
    scryfallDetails: Card;
};

export type Deck = {
  id: string;
  name: string;
  cards: Array<CardReference>;
  importText: string;
  uid: string;
};

const collectionName = "decks";
const decksCollection = collection(db, collectionName);

export async function getMyDecks(uid: string): Promise<Array<Deck>> {
    const myDecksQuery = query(decksCollection, where("uid", "==", uid));
    const querySnapshot = await getDocs(myDecksQuery);

    const decks: Array<Deck> = [];
    querySnapshot.forEach((doc) => {
        const id = doc.id;
        const {name, cards, uid, importText} = doc.data();

        decks.push({
            id,
            name,
            cards,
            uid,
            importText,
        });
    });
    return decks;
}

export function cardsToShuffle(deck: Deck): Array<any> {
    const cardList: Array<any> = [];
    deck.cards.forEach((card) => {
        for (let i = 0; i < card.count; i++) {
            cardList.push(card.scryfallDetails);
        }
    });
    return cardList;
}

export async function addDeck(deck: Deck): Promise<void> {
    try {
        const docRef = await addDoc(collection(db, collectionName), deck);
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}