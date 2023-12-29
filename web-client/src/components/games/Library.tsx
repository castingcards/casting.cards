import React from "react";

import {Paper} from "@mui/material";
import Typeogrophy from '@mui/material/Typography';
import {styled} from '@mui/material/styles';

import type {PlayerState} from "../../firebase-interop/models/game";

const LibraryCard = styled(Paper)(({ theme }) => ({
  width: 120,
  height: 120,
  padding: theme.spacing(2),
  ...theme.typography.body2,
  textAlign: 'center',
}));


type Props = {
    player: PlayerState;
}

export function Library({player}: Props) {
    return (
        <LibraryCard variant="outlined">
            <Typeogrophy variant="body1">Library ({player.shuffledLibraryCardIds.length})</Typeogrophy>
        </LibraryCard>
    );
}