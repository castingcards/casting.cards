import * as React from "react";
import {Link} from 'react-router-dom';

import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

import {CenterLayout} from '../layouts/Center';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollection} from 'react-firebase-hooks/firestore';

import {auth} from "../../firebase-interop/firebaseInit";
import {NewDeck} from "./NewDeck"
import {myDecksQuery, deleteDeck} from "../../firebase-interop/models/deck";
import {allScryfallCards} from "../../firebase-interop/business-logic/deck"

function DecksContent(): React.ReactElement {
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
    <>
        <Typography variant="h4" gutterBottom>Decks</Typography>
        {user && <NewDeck />}
        <List>
          {decks.docs.map(deckReference => {
            const deckId = deckReference.id;
            const deck = deckReference.data();
            return (<ListItem key={deckId} sx={{backgroundColor: "#EEEEEE"}}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => deleteDeck(deckId)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <Link to={`/decks/${deckId}`}>
                <ListItemText
                  primary={deck.name}
                  secondary={allScryfallCards(deck).length + " cards"}
                />
              </Link>
            </ListItem>)
          })}
        </List>
    </>
  );
}

export function Decks(): React.ReactElement {
  return <CenterLayout><DecksContent/></CenterLayout>;
}
