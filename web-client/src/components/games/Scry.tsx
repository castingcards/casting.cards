import React from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import { Stack } from "@mui/material";

import { ListCardsLayout } from "./Layouts";

import {mutate} from "../../firebase-interop/baseModel";
import { PlayerState } from "../../firebase-interop/models/playerState";
import {scryCard} from "../../firebase-interop/business-logic/playerState";


export function ScryModal({playerState, open}: {
    playerState: PlayerState,
    open: boolean,
}) {

    const handleScry = React.useCallback(
        async () => {
            await mutate(playerState, scryCard());
        },
        [playerState],
    );

    return <Dialog open={open}>
        <Box component="form" sx={{
            minWidth: 400,
            minHeight: 300,
        }}>
            <Stack direction="column" padding={1}>
                <Button variant="outlined" onClick={handleScry}>Scry a Card</Button>

                <Box sx={{marginTop: 12}}>
                    <ListCardsLayout
                        cardStates={playerState.scryCards}
                        bucket={"scry"}
                        title={"Scried Cards"}
                        interactive={true}
                        playerState={playerState}
                        hidden={false}
                        cardActions={["MOVE_TO_TOP_OF_LIBRARY", "MOVE_TO_BOTTOM_OF_LIBRARY"]}
                    />
                </Box>
            </Stack>
        </Box>
    </Dialog>;
}