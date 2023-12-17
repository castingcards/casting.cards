import React from "react";
import {Link} from 'react-router-dom';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import { useAuthState } from 'react-firebase-hooks/auth';

import {getMyDecks} from "../../firebase-interop/models/deck";
import {auth} from "../../firebase-interop/firebaseInit";
import {NewDeck} from "./NewDeck"
import {cardsToShuffle} from "../../firebase-interop/models/deck";

import type {Deck} from "../../firebase-interop/models/deck";

export function Decks() {
  const [user] = useAuthState(auth);

  // TODO use collection watcher instread of this
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

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems={"center"}
    >
      <Box sx={{maxWidth: 800}}>
        <Typography variant="h2" gutterBottom>Decks</Typography>

        {user && <NewDeck onNewDeck={deck => setDecks([
          ...decks,
          deck,
        ])}/>}

        <Typography variant="h3">Here are your decks!</Typography>

        <List>
          {decks.map(deck => (
            <ListItem key={deck.id} sx={{backgroundColor: "#EEEEEE"}}>
              <Link to={`/decks/${deck.id}`}>
                <ListItemText
                  primary={deck.name}
                  secondary={cardsToShuffle(deck).length + " cards"}
                />
              </Link>
            </ListItem>)
            )}
        </List>
      </Box>
    </Box>
  );
}