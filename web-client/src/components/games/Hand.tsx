import React from "react";

import { Paper } from "@mui/material";
import Typeogrophy from '@mui/material/Typography';
import {styled} from '@mui/material/styles';

import type { PlayerState } from "../../firebase-interop/models/game";

const HandCard = styled(Paper)(({ theme }) => ({
  width: "100%",
  height: 200,
  padding: theme.spacing(2),
  ...theme.typography.body2,
  textAlign: 'center',
}));


type Props = {
    player: PlayerState;
}

export function Hand({player}: Props) {
    return (
        <HandCard variant="outlined">
            <Typeogrophy variant="body1">Hand ({player.handCardIds.length})</Typeogrophy>
        </HandCard>
    );
}