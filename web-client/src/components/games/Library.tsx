import React from "react";

import { Grid } from "@mui/material";
import Typeogrophy from '@mui/material/Typography';

import {cardStyle, CARD_HEIGHT, CARD_WIDTH } from "./Card";

import {mutate} from "../../firebase-interop/baseModel";
import {drawCard} from "../../firebase-interop/business-logic/playerState";
import type {PlayerState} from "../../firebase-interop/models/playerState";
import type {Game} from "../../firebase-interop/models/game";



type Props = {
    game: Game;
    player: PlayerState;
}

export function Library({game, player}: Props) {
    const handleDrawCard = React.useCallback(
        async () => {
            await mutate(player, drawCard());
        },
        [player],
    );

    return (
        <Grid container sx={cardStyle}>
            <Typeogrophy variant="body1">Library {player.libraryCards.length}</Typeogrophy>
            <img
                src="/card-back.png"
                alt="a decorative card back"
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                style={{cursor: "pointer"}}
                onDoubleClick={handleDrawCard}
            />
        </Grid>
    );
}