import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import {auth} from "../../firebase-interop/firebaseInit";
import {useAuthState} from 'react-firebase-hooks/auth';

import {Game, addGame} from "../../firebase-interop/models/game";


export function NewGame() {
    const [user] = useAuthState(auth);
    const [formExpanded, setFormExpanded] = React.useState(false);
    const [gameName, setGameName] = React.useState("");

    const createGame = React.useCallback(() => {
        if (user?.uid && gameName) {
            addGame(user.uid, new Game(gameName)).then(() => {
                setGameName("");
                setFormExpanded(false);
            });
        }
    }, [gameName, user?.uid]);

    return (
        <Accordion expanded={formExpanded} onChange={(e, newExpanded) => setFormExpanded(newExpanded)}>
            <AccordionSummary>Create a Game</AccordionSummary>
            <AccordionDetails>
                <Box component="form">
                    <Stack direction="column" spacing={2}>
                        <TextField
                            id="game-name" label="Game Name"
                            value={gameName} onChange={e => setGameName(e.target.value)}
                        />
                        <Button variant="outlined" onClick={createGame}>Create</Button>
                    </Stack>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}