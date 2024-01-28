import React from "react";
import { useHttpsCallable } from 'react-firebase-hooks/functions';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import {useAuthState} from 'react-firebase-hooks/auth';
import {auth, functions} from "../../firebase-interop/firebaseInit";

import {addDeck} from "../../firebase-interop/models/deck";
import {fromText} from "../../importer/from-text";

async function importDeckText(uid: string, deckName: string, deckText: string) {
    const deck = await fromText(deckText);
    await addDeck(uid, deck.withName(deckName).withSource(deckText));
    return deck;
}

export function NewDeck() {
    const [importFromURL] = useHttpsCallable(functions, "importFromURL");
    const [user] = useAuthState(auth);
    const [deckName, setDeckName] = React.useState("");
    const [deckText, setDeckText] = React.useState("");
    const [deckUrl, setDeckUrl] = React.useState("");
    const [formExpanded, setFormExpanded] = React.useState(false);

    const importDeck = React.useCallback(() => {
        if (user?.uid && deckText) {
            importDeckText(user.uid, deckName, deckText).then(deck => {
                setDeckName("");
                setDeckText("");
                setFormExpanded(false);
            });
        }
    }, [user?.uid, deckName, deckText]);

    const importDeckFromURL = React.useCallback(() => {
        if (user?.uid && deckUrl) {
            importFromURL(deckUrl).then(result => {
                setDeckUrl("");
                setFormExpanded(false);
            });
        }
    }, [importFromURL, user?.uid, deckUrl]);

    return (
        <Accordion expanded={formExpanded} onChange={(e, newExpanded) => setFormExpanded(newExpanded)}>
            <AccordionSummary>Add New Deck</AccordionSummary>
            <AccordionDetails>
                <Box component="form">
                    <Stack direction="column" spacing={2}>
                        <TextField
                            id="deck-url" label="From URL"
                            value={deckUrl} onChange={e => setDeckUrl(e.target.value)}
                        />
                        <Button variant="outlined" onClick={importDeckFromURL}>Import Deck</Button>
                    </Stack>
                </Box>

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