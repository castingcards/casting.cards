import React from "react";
import { useAuthState } from 'react-firebase-hooks/auth';

import {getDecks, addDeck} from "../../firebase-interop/models/deck";
import { auth } from "../../firebase-interop/firebaseInit";

import type {Deck} from "../../firebase-interop/models/deck";

async function createNewDeck(uid: string): Promise<Deck> {
  const deck = {
    id: "auto-deck-" + Math.random(),
    name: "New Deck",
    cards: [],
    uid,
    importText: "test",
  };
  await addDeck(deck);
  return deck;
}

export function Decks() {
  const [user] = useAuthState(auth);
  const [decks, setDecks] = React.useState<Array<Deck>>([]);

  React.useEffect(() => {
    if (!user) {
      return;
    }
    getDecks().then(decks => {
      console.log("GET DECKS!", decks)
      setDecks(decks);
    });
  }, [user]);

  const makeDeck = React.useCallback(() => {
    createNewDeck(user?.uid || "no uid").then(deck => {
      setDecks(decks.concat(deck));
    });
  }, [decks, user]);

  return <div>
    <h1>Decks</h1>
    {user && <button onClick={makeDeck}>Create Deck</button>
    }
    <p>Here are your decks!</p>
    <ul>
      {decks.map(deck => <li key={deck.id}>{deck.name}</li>)}
    </ul>
  </div>;
}