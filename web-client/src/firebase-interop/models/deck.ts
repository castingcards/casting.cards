import { collection, getDocs, addDoc } from "firebase/firestore";
import {db} from "../firebaseInit";

export type Deck = {
  id: string;
  name: string;
  cards: string[];
  importText: string;
  uid: string;
};

const collectionName = "decks";

export async function getDecks(): Promise<Array<Deck>> {
    const querySnapshot = await getDocs(collection(db, collectionName));

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

export async function addDeck(deck: Deck): Promise<void> {
    try {
        const docRef = await addDoc(collection(db, collectionName), deck);
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}