import React from "react";

import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typeogrophy from '@mui/material/Typography';

import {styled} from '@mui/material/styles';

import type {PlayerState} from "../../firebase-interop/models/game";
import type {Game} from "../../firebase-interop/models/game";

const LibraryCard = styled(Paper)(({ theme }) => ({
  width: 120,
  height: 120,
  padding: theme.spacing(2),
  ...theme.typography.body2,
  textAlign: 'center',
}));


type Props = {
    game: Game;
    player: PlayerState;
}

export function Library({game, player}: Props) {
    const drawCard = React.useCallback(
        async () => {
            player.drawCard();
            await game.save();
        },
        [game, player],
    );

    return (
        <LibraryCard variant="outlined">
            <Typeogrophy variant="body1">Library ({player.shuffledLibraryCardIds.length})</Typeogrophy>
            <Button onClick={drawCard}>Draw Card</Button>
        </LibraryCard>
    );
}