import React from "react";
import {getDecks, addDeck} from "../../firebase-interop/models/deck";
import { existingUser } from "../../firebase-interop/signInFunctions";

import type {Deck} from "../../firebase-interop/models/deck";

async function createNewDeck(): Promise<Deck> {
  const deck = {
    id: "auto-deck-" + Math.random(),
    name: "New Deck",
    cards: [],
    uid: existingUser?.uid || "no uid",
    importText: "test",
  };
  await addDeck(deck);
  return deck;
}

export function Decks() {
  const [decks, setDecks] = React.useState<Array<Deck>>([]);

  React.useEffect(() => {
    getDecks().then(decks => {
      console.log("GET DECKS!", decks)
      setDecks(decks);
    });
  }, []);

  const makeDeck = React.useCallback(() => {
    createNewDeck().then(deck => {
      setDecks(decks.concat(deck));
    });
  }, [decks]);

  return <div>
    <h1>Decks</h1>
    {existingUser && <button onClick={makeDeck}>Create Deck</button>
    }
    <p>Here are your decks!</p>
    <ul>
      {decks.map(deck => <li key={deck.id}>{deck.name}</li>)}
    </ul>
  </div>;
}