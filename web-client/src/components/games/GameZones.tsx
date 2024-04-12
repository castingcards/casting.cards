import * as React from "react";

import { createStyles } from "@mui/material";

import { ListCardsLayout, StackedCardsLayout } from "./Layouts";

import { PlayerState } from "../../firebase-interop/models/playerState";

export function Exile({ playerState, interactive }: {
    playerState: PlayerState;
    interactive?: boolean;
}) {
    // TODO(miguel): wire in cards that are in the exile bucket
    const cards = playerState.exileCards;

    return (
        <StackedCardsLayout
            title="Exile"
            cardStates={cards}
            playerState={playerState}
            bucket="exile"
            interactive={interactive}
            cardActions={["MOVE_TO_ZONE", "SEARCH"]} />
    );
}export function Graveyard({ playerState, interactive }: {
    playerState: PlayerState;
    interactive?: boolean;
}) {
    // TODO(miguel): wire in cards that are in the graveyard bucket
    const cards = playerState.graveyardCards;

    return (
        <StackedCardsLayout
            title="Graveyard"
            cardStates={cards}
            playerState={playerState}
            bucket="graveyard"
            interactive={interactive}
            cardActions={["MOVE_TO_ZONE", "SEARCH"]} />
    );
}
export function Lands({ playerState, interactive }: {
    playerState: PlayerState;
    interactive?: boolean;
}) {
    const cards = playerState.landCards;
    return (
        <ListCardsLayout
            title="Lands"
            playerState={playerState}
            cardStates={cards}
            bucket="land"
            interactive={interactive}
            cardActions={["MOVE_TO_ZONE", "TAP", "MOVE_TO_BOTTOM_OF_LIBRARY", "MOVE_TO_TOP_OF_LIBRARY", "NEW_COUNTER"]} />
    );
}
export function Battleground({ playerState, interactive }: {
    playerState: PlayerState;
    interactive?: boolean;
}) {
    const cards = playerState.battlefieldCards;
    return (
        <ListCardsLayout
            title="Battleground"
            playerState={playerState}
            cardStates={cards}
            bucket="battlefield"
            interactive={interactive}
            cardActions={["MOVE_TO_ZONE", "TAP", "MOVE_TO_BOTTOM_OF_LIBRARY", "MOVE_TO_TOP_OF_LIBRARY", "NEW_COUNTER"]} />
    );
}
export function Hand({ playerState, opponent, interactive }: {
    playerState: PlayerState;
    opponent?: boolean;
    interactive?: boolean;
}) {
    const cards = playerState.handCards;
    return (
        <ListCardsLayout
            title="Hand"
            playerState={playerState}
            cardStates={cards}
            hidden={opponent}
            bucket="hand"
            interactive={interactive}
            cardActions={["MOVE_TO_ZONE", "MOVE_TO_TOP_OF_LIBRARY", "MOVE_TO_BOTTOM_OF_LIBRARY"]} />
    );
}
export function CommandZone({ playerState, interactive }: {
    playerState: PlayerState;
    interactive?: boolean;
}) {
    const cards = playerState.commandzoneCards;
    return (
        <ListCardsLayout
            title="Command Zone"
            playerState={playerState}
            cardStates={cards}
            bucket="commandzone"
            interactive={interactive}
            cardActions={["MOVE_TO_ZONE"]} />
    );
}
export function zoneStyle() {
    return createStyles({
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        borderStyle: "solid",
        borderColor: "rgba(0, 0, 0, 0.4)",
        borderWidth: 2,
        borderRadius: 2,
        margin: "1px",
        width: "90%",
    });
}

