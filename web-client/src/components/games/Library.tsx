import React from "react";

import { Grid } from "@mui/material";
import Typeogrophy from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import {cardStyle, CARD_HEIGHT, CARD_WIDTH } from "./Card";
import {ScryModal} from "./Scry";

import {mutate} from "../../firebase-interop/baseModel";
import type {Game} from "../../firebase-interop/models/game";
import type {PlayerState} from "../../firebase-interop/models/playerState";
import {drawCard, scryCard, mulligan, search} from "../../firebase-interop/business-logic/playerState";


type Props = {
    game: Game;
    player: PlayerState;
    interactive?: boolean;
}

export function Library({game, player, interactive}: Props) {
    const [contextMenu, setContextMenu] = React.useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);

    const handleDrawCard = React.useCallback(
        async (drawCount: number) => {
            if (!interactive) {
                return;
            }
            await mutate(player, drawCard(drawCount));
            setContextMenu(null);
        },
        [player, interactive],
    );

    const handleMulligan = React.useCallback(
        async () => {
            if (!interactive) {
                return;
            }
            await mutate(player, mulligan());
            setContextMenu(null);
        },
        [player, interactive],
    );

    const handleSearch = React.useCallback(
        async () => {
            if (!interactive) {
                return;
            }

            mutate(player, search("library"));
            setContextMenu(null);
        },
        [interactive, player],
    );

    const handleScry = React.useCallback(
        async () => {
            await mutate(player, scryCard());
            setContextMenu(null);
        },
        [player],
    );

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
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

    const showScryModal = interactive && player.scryCards.length > 0;

    return (
        <Grid container sx={cardStyle}>
            <Typeogrophy variant="body1">Library {player.libraryCards.length}</Typeogrophy>
            <img
                src="/card-back.png"
                alt="a decorative card back"
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                style={{
                    cursor: interactive ? "pointer" : "",
                }}
                onDoubleClick={() => handleDrawCard(1)}
                onContextMenu={handleContextMenu}
            />

            {interactive && <Menu
                open={contextMenu !== null}
                onClose={() => setContextMenu(null)}
                anchorReference="anchorPosition"
                anchorPosition={
                contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
                }
            >
                <MenuItem onClick={handleScry}>Scry</MenuItem>
                <MenuItem onClick={() => handleDrawCard(1)}>Draw 1</MenuItem>
                <MenuItem onClick={() => handleDrawCard(7)}>Draw 7</MenuItem>
                <MenuItem onClick={handleMulligan}>Mulligan</MenuItem>
                <MenuItem onClick={handleSearch}>Search</MenuItem>
            </Menu>}

            {interactive && showScryModal && <ScryModal open={showScryModal} playerState={player} />}
        </Grid>
    );
}