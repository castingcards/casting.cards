import React from "react";
import {useDocument} from "react-firebase-hooks/firestore";
import Box from '@mui/material/Box';

import {Library} from "./Library";
import {Hand} from "./Hand";

import {playerStateDoc} from "../../firebase-interop/models/playerState";
import type { Game } from "../../firebase-interop/models/game";

type Props = {
    game: Game;
    uid: string;
}

export function GameBoard({game, uid}: Props) {
    const [playerStateDocReference, loading] = useDocument(playerStateDoc(game.id!)(uid));

    if (loading) {
        return <div>Loading...</div>;
    }

    const playerState = playerStateDocReference?.data();
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