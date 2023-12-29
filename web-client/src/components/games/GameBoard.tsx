import React from "react";
import Box from '@mui/material/Box';

import {ChooseDeck} from "./ChooseDeck";
import {Library} from "./Library";
import {Hand} from "./Hand";

import type { Game } from "../../firebase-interop/models/game";

type Props = {
    game: Game;
    uid: string;
}


export function GameBoard({game, uid}: Props) {
    const player = game.getPlayer(uid);

    if (!player.deckId) {
        return <ChooseDeck game={game} uid={uid} />;
    }

    return (
        <Box>
            <h1>{game.name}</h1>
            <h2>Player: {player.playerId}</h2>

            <Box>
                <Library player={player} />
                <Hand player={player} />
            </Box>
        </Box>
    );
}