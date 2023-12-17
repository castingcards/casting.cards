import React from "react";

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "../../firebase-interop/firebaseInit";

import {addDeck} from "../../firebase-interop/models/deck";
import {importCardDetails} from "../../business-logic/import-cards";

import type {Deck} from "../../firebase-interop/models/deck";

async function importDeckText(uid: string, deckName: string, deckText: string) {
    const cardDetails = await importCardDetails(deckText);

    const deck = {
        uid,
        id: "auto-deck-" + Math.random(), // TODO use a real id
        name: deckName,
        cards: cardDetails,
        importText: deckText,
    };

    await addDeck(deck);
    return deck;
}


export function NewDeck({onNewDeck}: {onNewDeck: (deck: Deck) => void}) {
    const [user] = useAuthState(auth);
    const [deckName, setDeckName] = React.useState("");
    const [deckText, setDeckText] = React.useState("");
    const [formExpanded, setFormExpanded] = React.useState(false);

    const importDeck = React.useCallback(() => {
        importDeckText(user?.uid || "", deckName, deckText).then(deck => {
            onNewDeck(deck);
            setDeckName("");
            setDeckText("");
            setFormExpanded(false);
        });
    }, [user, onNewDeck, deckName, deckText]);


    return (
        <Accordion expanded={formExpanded} onChange={(e, newExpanded) => setFormExpanded(newExpanded)}>
            <AccordionSummary>Add New Deck</AccordionSummary>
            <AccordionDetails>
                <Box component="form">
                    <Stack direction="column" spacing={2}>
                        <TextField
                            id="deck-name" label="Deck Name" variant="standard"
                            value={deckName} onChange={e => setDeckName(e.target.value)}
                        />
                        <TextField
                            id="deck-text" label="Deck Import Text" multiline rows={20}
                            value={deckText} onChange={e => setDeckText(e.target.value)}
                        />
                        <Button variant="outlined" onClick={importDeck}>Import Deck</Button>
                    </Stack>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}