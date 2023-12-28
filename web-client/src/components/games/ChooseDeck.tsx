import React from "react";

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

import {useCollection} from 'react-firebase-hooks/firestore';
import {myDecksQuery} from "../../firebase-interop/models/deck";
import {PlayerState, updateGame} from "../../firebase-interop/models/game";

import type {Game} from "../../firebase-interop/models/game";
import type {Deck} from "../../firebase-interop/models/deck";

type Props = {
    gameId: string;
    game: Game;
    uid: string;
}

export function ChooseDeck({gameId, game, uid}: Props) {
    const [decksResource, loading, error] = useCollection(myDecksQuery(uid));
    const [chosenDeck, setChosenDeck] = React.useState<string>("");

    const addDeckToGame = React.useCallback(
        (deckId: string) => {
            setChosenDeck(deckId);

            const player = game.getPlayer(uid);

            const decks = decksResource?.docs ?? [];
            const deckReference = decks.find(deck => deck.id === deckId);
            if (!deckReference) {
                throw new Error("Deck not found");
            }

            const deck = deckReference.data();
            if (!deck) {
                throw new Error("Deck not found");
            }

            player.withDeck(deckId, deck);

            updateGame(gameId, game);
        },
        [gameId, game, uid, decksResource?.docs],
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