import React from "react";

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

import {useCollection} from 'react-firebase-hooks/firestore';

import {pipeline} from "../../firebase-interop/baseModel";
import {myDecksQuery} from "../../firebase-interop/models/deck";
import {getOrCreatePlayerState} from "../../firebase-interop/models/playerState";
import {setDeckForPlayer} from "../../firebase-interop/business-logic/game";

import type {Game} from "../../firebase-interop/models/game";

type Props = {
    game: Game;
    uid: string;
    onDeckSelected: (deckId: string) => void;
}

export function ChooseDeck({game, uid, onDeckSelected}: Props) {
    const [decksResource, loading, error] = useCollection(myDecksQuery(uid));
    const [chosenDeck, setChosenDeck] = React.useState<string>("");

    const addDeckToGame = React.useCallback(
        async (deckId: string) => {
            let playerState = await getOrCreatePlayerState(game.id ?? "", uid);
            await pipeline(game, setDeckForPlayer(playerState, deckId));
            setChosenDeck(deckId);
            onDeckSelected(deckId);
        },
        [game, uid, onDeckSelected],
    );

    if (error) {
        return <strong>Error: {JSON.stringify(error)}</strong>;
    }

    if (loading) {
        return <span>Loading Decks...</span>
    }

    const decks = decksResource?.docs ?? [];
    if (!decks || decks.length === 0) {
        return <span>No decks found</span>;
    }

    return <Box>
        <FormControl fullWidth>
            <InputLabel id="select-deck-label">Choose a Deck</InputLabel>
            <Select
                labelId="select-deck-label"
                id="select-deck"
                label="Choose a Deck"
                value={chosenDeck}
                onChange={event => addDeckToGame(event.target.value as string)}
            >
                {decks.map(deck => (
                    <MenuItem key={deck.id} value={deck.id}>{deck.data().name}</MenuItem>
                ))}
            </Select>
        </FormControl>
    </Box>;
}