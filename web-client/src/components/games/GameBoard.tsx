import React from "react";
import Box from '@mui/material/Box';

import {Library} from "./Library";
import {Hand} from "./Hand";

import type { Game } from "../../firebase-interop/models/game";

type Props = {
    game: Game;
    uid: string;
}

export function GameBoard({game, uid}: Props) {
    const playerState = game.getPlayerState(uid);

    if (!playerState) {
        return <div>Bad bad.</div>;
    }

    return (
        <Box>
            <h1>{game.name}</h1>
            <Box>
                <Library game={game} player={playerState} />
                <Hand player={playerState} />
            </Box>
        </Box>
    );
}