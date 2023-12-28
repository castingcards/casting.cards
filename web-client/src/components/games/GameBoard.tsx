import React from "react";
import Box from '@mui/material/Box';
import Typeogrophy from '@mui/material/Typography';
import {Paper} from "@mui/material";
import {styled} from '@mui/material/styles';

import { ChooseDeck } from "./ChooseDeck";


import type { Game } from "../../firebase-interop/models/game";

type Props = {
    gameId: string;
    game: Game;
    uid: string;
}

const Library = styled(Paper)(({ theme }) => ({
  width: 120,
  height: 120,
  padding: theme.spacing(2),
  ...theme.typography.body2,
  textAlign: 'center',
}));

export function GameBoard({gameId, game, uid}: Props) {
    const player = game.getPlayer(uid);

    if (!player.deckId) {
        return <ChooseDeck game={game} gameId={gameId} uid={uid} />;
    }

    return (
        <Box>
            <h1>{game.name}</h1>
            <h2>Player: {player.playerId}</h2>

            <Box>
                <Library variant="outlined">
                    <Typeogrophy variant="body1">Library ({player.shuffledLibraryCardIds.length})</Typeogrophy>
                </Library>
            </Box>
        </Box>
    );
}