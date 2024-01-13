import React from "react";

import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typeogrophy from '@mui/material/Typography';

import {styled} from '@mui/material/styles';

import {pipeline} from "../../firebase-interop/baseModel";
import {drawCard} from "../../firebase-interop/business-logic/playerState";
import type {PlayerState} from "../../firebase-interop/models/playerState";
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
    const handleDrawCard = React.useCallback(
        async () => {
            await pipeline(player, drawCard());
        },
        [player],
    );

    return (
        <LibraryCard variant="outlined">
            <Typeogrophy variant="body1">Library ({player.libraryCards.length})</Typeogrophy>
            <Button onClick={handleDrawCard}>Draw Card</Button>
        </LibraryCard>
    );
}