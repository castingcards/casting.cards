import React from "react";

import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";

import { ListCardsLayout } from "./GameBoard";

import {PlayerState, CardState, CARD_BUCKETS} from "../../firebase-interop/models/playerState";


export function ShowStackModal({
    playerState,
    cardStates,
    bucket,
    open,
    onClose,
}: {
    playerState: PlayerState,
    cardStates: Array<CardState>,
    bucket: CARD_BUCKETS,
    open: boolean,
    onClose: () => void,
}) {

    return <Dialog open={open} onClose={onClose} fullScreen sx={{
        top: "10%",
        left: "10%",
        right: "10%",
        bottom: "10%",
    }}>
        <Box sx={{
            paddingTop: 16,
        }}>
            <ListCardsLayout
                cardStates={cardStates}
                bucket={bucket}
                title={"Cards"}
                interactive={true}
                playerState={playerState}
                hidden={false}
                searching={true}
            />
        </Box>
    </Dialog>;
}