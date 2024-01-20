import React from "react";

import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import {PlayerState} from "../../firebase-interop/models/playerState";
import { Button } from "@mui/material";

import { mutate } from "../../firebase-interop/baseModel";
import {adjustLife} from "../../firebase-interop/business-logic/playerState";

export function PlayerBadge({playerState, interactive}: {
    playerState: PlayerState,
    interactive?: boolean,
}) {
    const onIncreaseLife = () => {
        mutate(playerState, adjustLife(1));
    }
    const onDecreaseLife = () => {
        mutate(playerState, adjustLife(-1));
    }

    return (
        <Grid container direction="column" alignItems="center" spacing={1} border={1} sx={{backgroundColor: "white"}}>
            <Grid>
                <Typography variant="body1" style={{
                    "width": 100,
                    "whiteSpace": "nowrap",
                    "overflow": "hidden",
                    "textOverflow": "ellipsis",
                }}>
                    {playerState.playerId}
                </Typography>
            </Grid>
            <Grid direction="row">
                {interactive && <Button variant="contained" color="primary" size="small" onClick={onIncreaseLife}>+1</Button>}
                <Typography variant="h6">{playerState.life}</Typography>
                {interactive && <Button variant="contained" color="secondary" size="small" onClick={onDecreaseLife}>-1</Button>}
            </Grid>
        </Grid>
    );
}