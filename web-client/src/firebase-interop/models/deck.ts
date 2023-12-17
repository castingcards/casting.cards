import { collection, query, where, getDocs, addDoc, setDoc, doc } from "firebase/firestore";
import {db} from "../firebaseInit";

import type {Card} from "scryfall-sdk";

export type CardReference = {
    count: number;
    scryfallDetails: Card;
};

export type Deck = {
  id?: string;
  name: string;
  cards: Array<CardReference>;
  importText: string;
  uid: string;
  commanderId?: string;
};

const collectionName = "decks";
const decksCollection = collection(db, collectionName);

export async function getMyDecks(uid: string): Promise<Array<Deck>> {
    const myDecksQuery = query(decksCollection, where("uid", "==", uid));
    const querySnapshot = await getDocs(myDecksQuery);

    const decks: Array<Deck> = [];
    querySnapshot.forEach((doc) => {
        const {name, cards, uid, importText, commanderId} = doc.data();

        decks.push({
            id: doc.id,
            name,
            cards,
            uid,
            importText,
            commanderId,
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

export async function updateDeck(deck: Deck): Promise<void> {
    try {
        if (!deck.id) {
            throw new Error("Deck must have an ID to update");
        }
        console.log("Updating deck", deck);
        const docRef = await setDoc(doc(db, collectionName, deck.id), deck);
        console.log("Document written: ", docRef);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}