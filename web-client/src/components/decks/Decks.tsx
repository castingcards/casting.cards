import React from "react";
import {Link} from 'react-router-dom';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollection} from 'react-firebase-hooks/firestore';

import {auth} from "../../firebase-interop/firebaseInit";
import {NewDeck} from "./NewDeck"
import {myDecksQuery} from "../../firebase-interop/models/deck";

export function Decks() {
  const [user] = useAuthState(auth);
  const [decks, loading, error] = useCollection(myDecksQuery(user?.uid || ""));

  if (error) {
    return <strong>Error: {JSON.stringify(error)}</strong>;
  }

  if (loading) {
    return <span>Loading Decks...</span>
  }

  if (!decks) {
    return <span>No decks found</span>;
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems={"center"}
    >
      <Box sx={{maxWidth: 800}}>
        <Typography variant="h2" gutterBottom>Decks</Typography>

        {user && <NewDeck />}

        <Typography variant="h3">Here are your decks!</Typography>

        <List>
          {decks.docs.map(deckReference => {
            const deckId = deckReference.id;
            const deck = deckReference.data();
            return (<ListItem key={deckId} sx={{backgroundColor: "#EEEEEE"}}>
              <Link to={`/decks/${deckId}`}>
                <ListItemText
                  primary={deck.name}
                  secondary={deck.allCards().length + " cards"}
                />
              </Link>
            </ListItem>)
          })}
        </List>
      </Box>
    </Box>
  );
}