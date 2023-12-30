import React from "react";

import Paper from "@mui/material/Paper";
import Typeogrophy from '@mui/material/Typography';
import List from '@mui/material/Stack';
import ListItem from '@mui/material/ListItem';
import {styled} from '@mui/material/styles';

import {Card} from "./Card";
import type {PlayerState} from "../../firebase-interop/models/playerState";

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
            <List direction="row" spacing={2}>
                {player.handCardIds.map(cardId => <ListItem key={cardId}>
                    <Card player={player} scryfallId={cardId} />
                </ListItem>)}
            </List>
        </HandCard>
    );
}