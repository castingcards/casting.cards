import React from "react";
import {useDocument} from 'react-firebase-hooks/firestore';

import Grid from '@mui/material/Unstable_Grid2';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import {NewCounterModal} from "./NewCounter";
import {Counters} from "./Counters";

import {mutate} from "../../firebase-interop/baseModel";
import {CardReference, deckDoc} from "../../firebase-interop/models/deck";
import {ALL_CARD_BUCKETS} from "../../firebase-interop/models/playerState";
import {imageForCard} from "../../firebase-interop/business-logic/cards";
import {moveCard, toggleTapped, search} from "../../firebase-interop/business-logic/playerState";
import {transformOracleText} from "../../firebase-interop/business-logic/cards";
import type {PlayerState, CARD_BUCKETS, CardState, Token} from "../../firebase-interop/models/playerState";
import type {Card as ScryfallCard} from "scryfall-sdk";

export type CardAction = "ALL"
    | "NEW_COUNTER"
    | "MOVE_TO_TOP_OF_LIBRARY"
    | "MOVE_TO_BOTTOM_OF_LIBRARY"
    | "MOVE_TO_ZONE"
    | "SEARCH";

type Props = {
    playerState: PlayerState;
    cardState: CardState;
    bucket: CARD_BUCKETS;
    hidden?: boolean;
    interactive?: boolean;
    cardActions: Array<CardAction>;
}

function possibleBuckets(bucketsToExclude: Array<CARD_BUCKETS>): Array<CARD_BUCKETS> {
    const result: Array<CARD_BUCKETS> = [];
    for (const bucket of ALL_CARD_BUCKETS) {
        if (!bucketsToExclude.includes(bucket)) {
            result.push(bucket);
        }
    }

    return result;
}

export const CARD_HEIGHT: number = 120;
export const CARD_WIDTH: number = 80;

export const cardStyle = {
    justifyContent: "center",
    alignContent: "center",
    color: "#AAAAAA",
    border: "2px solid transparent",
    boxSizing: "content-box !important",
    borderRadius: "4px",
    overflow: "visible",
    width: `${CARD_WIDTH}px`,
    height: `${CARD_HEIGHT}px`,
};

function getAltTextForCard(card: ScryfallCard): string {
    let output = `Name: ${card.name}\n\n`;

    if (card.mana_cost) {
        output += `Mana Cost: ${transformOracleText(card.mana_cost)}\n\n`;
    }

    output += `Type: ${card.type_line}\n\n`;
    output += `Rarity: ${card.rarity}\n\n`;
    output += `${transformOracleText(card.oracle_text ?? "")}`;

    if (card.power || card.toughness) {
        output += `\n\nPower/Toughness: ${card.power ?? "--"}/${card.toughness ?? "--"}`;
    }

    return output;
}

export function Card({
    playerState,
    cardState,
    bucket,
    hidden,
    interactive,
    cardActions,
}: Props) {
    const [gameResource, loading, error] = useDocument(playerState.deckId ? deckDoc(playerState.deckId) : undefined);
    const [contextMenu, setContextMenu] = React.useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);
    const [openNewCounter, setOpenNewCounter] = React.useState(false);

    // TODO(miguel): figure out a good way to report errors.  We probably
    // don't want to just render an error string instead of a card.  Perhaps
    // we render a place holder card image instead.
    // Same for the loading state.
    if (error) {
        return <ErrorCard>{JSON.stringify(error)}</ErrorCard>;
    }

    if (loading) {
        return <LoadingCard/>
    }

    const enableCardAction = (cardAction: string) => {
        if (cardActions.includes("ALL")) {
            return true;
        }

        return cardActions.includes(cardAction.toUpperCase() as CardAction);
    };

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

    const handleDoubleClick = (event: React.MouseEvent) => {
        if (!interactive) {
            return;
        }

        mutate(playerState, toggleTapped(cardState.id));
    }

    const handleMoveCard = (location: CARD_BUCKETS) => {
        if (!interactive) {
            return;
        }

        mutate(playerState, moveCard(cardState.id, bucket, location));
        setContextMenu(null);
    };

    const handleMoveCardToTopOfLibrary = () => {
        if (!interactive) {
            return;
        }

        mutate(playerState, moveCard(cardState.id, bucket, "library", true));
        setContextMenu(null);
    }

    const handleMoveCardToBottomOfLibrary = () => {
        if (!interactive) {
            return;
        }

        mutate(playerState, moveCard(cardState.id, bucket, "library"));
        setContextMenu(null);
    }

    const handleNewCounter = () => {
        if (!interactive) {
            return;
        }

        setOpenNewCounter(true);
        setContextMenu(null);
    };

    const handleSearch = () => {
        if (!interactive) {
            return;
        }

        mutate(playerState, search(bucket));
        setContextMenu(null);
    }

    const deck = gameResource?.data();
    const card = deck?.cards.find(card => card.scryfallDetails.id === cardState.scryfallId);

    const token = cardState.tokenName ? playerState.tokenDefinitions.find(token => token.name === cardState.tokenName) : undefined;

    const possibleBucketsForCard = possibleBuckets([bucket, "scry", "library", "search"]);

    const altText = card?.scryfallDetails ?
        getAltTextForCard(card?.scryfallDetails)
        : "Unknown Card";

    return (
        <Grid container sx={cardStyle}>
            <div style={{
                    position: "relative",
                    transform: cardState.tapped ? 'rotate(90deg)' : 'none',
                }}
                title={hidden ? "Hidden Card" : altText}
                onContextMenu={handleContextMenu} onDoubleClick={handleDoubleClick}
            >
                <div>
                    {card ? <ScryfallCardImage
                        card={card}
                        hidden={hidden}
                        interactive={interactive}
                    /> : <TokenDetails token={token} /> }
                </div>

                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                }}>
                    <Counters
                        playerState={playerState}
                        cardId={cardState.id}
                        counters={cardState.counters}
                        interactive={interactive}
                    />
                </div>
            </div>

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
                {enableCardAction("NEW_COUNTER") && <MenuItem onClick={handleNewCounter}>
                    New counter
                </MenuItem>}
                {enableCardAction("MOVE_TO_TOP_OF_LIBRARY") && <MenuItem onClick={handleMoveCardToTopOfLibrary}>
                    Move to Top of Library
                </MenuItem>}
                {enableCardAction("MOVE_TO_BOTTOM_OF_LIBRARY") && <MenuItem onClick={handleMoveCardToBottomOfLibrary}>
                    Move to Bottom of Library
                </MenuItem>}
                {enableCardAction("SEARCH") && <MenuItem onClick={() => handleSearch()}>
                    Search
                </MenuItem>}
                {enableCardAction("MOVE_TO_ZONE") && possibleBucketsForCard.map(bucket => (
                    <MenuItem key={bucket} onClick={() => handleMoveCard(bucket)}>
                        Move to {bucket}
                    </MenuItem>
                ))}
            </Menu>}

            {openNewCounter && <NewCounterModal
                playerState={playerState}
                cardId={cardState.id}
                open={openNewCounter}
                onClose={() => setOpenNewCounter(false)}
            />}
        </Grid>
    );
}

function ScryfallCardImage({card, hidden, interactive}: {
    card: CardReference,
    hidden?: boolean,
    interactive?: boolean,
}) {
    const imageUrl = card ? imageForCard(card.scryfallDetails) : "";
    const cardBack = "/card-back.png";
    const altText = card?.scryfallDetails ?
        getAltTextForCard(card?.scryfallDetails)
        : "Unknown Card";


    return <img
        src={hidden ? cardBack : imageUrl}
        alt={hidden ? "Hidden Card" : altText}
        title={hidden ? "Hidden Card" : altText}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        style={{
            cursor: interactive ? 'context-menu' : "",
        }}
    />;
}

function TokenDetails({token}: {token: Token | undefined}) {
    if (!token) {
        return <EmptyCard/>;
    }

    return <Grid container sx={{
        ...cardStyle,
        borderColor: "#AAAAAA",
        backgroundColor: "#FFFFFF",
    }}>
        <Stack direction="column" spacing={1}>
            <Typography variant="h6">{token.name}</Typography>
            <Typography variant="body2">{token.abilities}</Typography>
            <Typography variant="body2">{token.power}/{token.toughness}</Typography>
        </Stack>
    </Grid>
}

export function ErrorCard({children}: {children: React.ReactNode}) {
    // TODO(miguel): Add a better error card image
    return (
        <Grid container sx={{...cardStyle, borderColor: "#AAAAAA"}}>
            {children}
        </Grid>
    );
}

export function LoadingCard() {
    // TODO(miguel): Add a proper loading card image
    return (
        <Grid container sx={{...cardStyle, borderColor: "#AAAAAA"}}>
            Loading...
        </Grid>
    );
}

export function EmptyCard() {
    // TODO(miguel): Add a proper empty card image
    return (
        <Grid container sx={{...cardStyle, borderColor: "#AAAAAA"}}>
            Empty
        </Grid>
    );
}
