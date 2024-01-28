import React from "react";

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import {PlayerState, Counter} from "../../firebase-interop/models/playerState";
import {mutate} from "../../firebase-interop/baseModel";
import {incrementCounter, removeCounter} from "../../firebase-interop/business-logic/playerState";

function CounterDetails({playerState, cardId, counter, index, interactive}: {
    playerState: PlayerState,
    cardId: number,
    counter: Counter;
    index: number;
    interactive?: boolean;
}) {
    const [contextMenu, setContextMenu] = React.useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenu(
        contextMenu === null
            ? {
                mouseX: event.clientX + 2,
                mouseY: event.clientY - 6,
            }
            : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
            // Other native context menus might behave different.
            // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
            null,
        );
    };

    const handleIncrement = () => {
        if (!interactive) {
            return;
        }

        mutate(playerState, incrementCounter(cardId, index));
    };

    const handleDecrement = () => {
        if (!interactive) {
            return;
        }

        mutate(playerState, incrementCounter(cardId, index, -1));
    };

    const handleRemove = () => {
        if (!interactive) {
            return;
        }

        mutate(playerState, removeCounter(cardId, index));
        setContextMenu(null);
    };

    const position = positionMap[counter.placement] ?? positionMap["upper-left"];
    return <div
                onContextMenu={handleContextMenu}
                style={{
                    position: "absolute",
                    ...position
                }}
                onDoubleClick={(event) => event.stopPropagation()}
    >
        <Chip
            sx={{
                background: "rgba(220, 220, 220, .8)",

                "&:hover": {
                    background: "rgba(255, 255, 255, 1)",
                },
            }}
            label={counter.count}
            title={counter.kind}
            onClick={interactive ? handleIncrement: undefined}
            size="small"
        />
        <Menu
            open={contextMenu !== null}
            onClose={() => setContextMenu(null)}
            anchorReference="anchorPosition"
            anchorPosition={
            contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }
        >
            <MenuItem onClick={handleIncrement}>+1</MenuItem>
            <MenuItem onClick={handleDecrement}>-1</MenuItem>
            <MenuItem onClick={handleRemove}>Remove</MenuItem>
        </Menu>
    </div>;
}

export function Counters({playerState, counters, cardId, interactive}: {
    playerState: PlayerState,
    cardId: number,
    counters: Array<Counter>,
    interactive?: boolean,
}) {
    return <Box sx={{width: "100%", height: "100%"}}>
        {counters.map((counter, i) => <CounterDetails
            key={i}
            playerState={playerState}
            cardId={cardId}
            counter={counter}
            index={i}
            interactive={interactive}
        />)}
    </Box>;
}

const positionMap = {
    "upper-left": {top: 0, left: 0},
    "top": {top: 0, left: "50%", transform: "translateX(-50%)"},
    "upper-right": {top: 0, right: 0},
    "right": {top: "50%", right: 0, transform: "translateY(-50%)"},
    "lower-left": {bottom: 0, left: 0},
    "left": {top: "50%", left: 0, transform: "translateY(-50%)"},
    "lower-right": {bottom: 0, right: 0},
    "bottom": {bottom: 0, left: "50%", transform: "translateX(-50%)"},
    "middle": {top: "50%", left: "50%", transform: "translate(-50%, -50%)"},
};