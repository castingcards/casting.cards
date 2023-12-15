import React from "react";

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import { useAuthState } from 'react-firebase-hooks/auth';

import {getMyDecks, addDeck} from "../../firebase-interop/models/deck";
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
    getMyDecks(user.uid).then(decks => {
      console.log("GET DECKS!", decks)
      setDecks(decks);
    });
  }, [user]);

  const makeDeck = React.useCallback(() => {
    createNewDeck(user?.uid || "no uid").then(deck => {
      setDecks(decks.concat(deck));
    });
  }, [decks, user]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems={"center"}
    >
      <Box sx={{maxWidth: 800}}>
        <Typography variant="h2" gutterBottom>Decks</Typography>

        {user && <Button variant="outlined" onClick={makeDeck}>Create Deck</Button>}

        <Typography variant="h3">Here are your decks!</Typography>

        <List>
          {decks.map(deck => (
            <ListItem key={deck.id} sx={{backgroundColor: "#EEEEEE"}}>
              <ListItemText
                primary={deck.name}
                secondary={deck.cards.length + " cards"}
              />
            </ListItem>)
            )}
        </List>
      </Box>
    </Box>
  );
}