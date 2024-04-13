import React from "react";
import {useDocument} from 'react-firebase-hooks/firestore';

import Grid from '@mui/material/Unstable_Grid2';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import ListItemText from '@mui/material/ListItemText';

import {NewCounterModal} from "./NewCounter";
import {Counters} from "./Counters";
import {CardDetails} from "./CardDetails";

import {mutate} from "../../firebase-interop/baseModel";
import {CardReference, deckDoc} from "../../firebase-interop/models/deck";
import {ALL_CARD_BUCKETS} from "../../firebase-interop/models/playerState";
import {imageForCard} from "../../firebase-interop/business-logic/cards";
import {moveCard, toggleTapped, search} from "../../firebase-interop/business-logic/playerState";
import {transformOracleText} from "../../firebase-interop/business-logic/cards";
import type {PlayerState, CARD_BUCKETS, CardState, Token} from "../../firebase-interop/models/playerState";
import type {Card as ScryfallCard} from "scryfall-sdk";

export type CardAction = "ALL"
    | "TAP"
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
    const [showDetails, setShowDetails] = React.useState(false);
    const [focusing, setFocusing] = React.useState(false);
    const myRef = React.useRef(null);

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

    const focusRef = () =>{
        const x: any = myRef?.current;
        x.focus();
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

    const handleTap = () => {
        if (!interactive) {
            return;
        }

        mutate(playerState, toggleTapped(cardState.id));
        setContextMenu(null);
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

        mutate(playerState, moveCard(cardState.id, bucket, "library", 0));
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

    const handleKeyPress = (event: React.KeyboardEvent) => {
        let handled = false;

        if (event.metaKey) {
            for (const b of possibleBuckets([bucket, "scry", "library", "search"])) {
                if (!handled &&
                    event.key.toUpperCase() === b[0].toUpperCase() &&
                    enableCardAction("MOVE_TO_ZONE"))
                {
                    handled = true;
                    handleMoveCard(b);
                }
            }
        } else {
            if (event.key.toUpperCase() === "T" && enableCardAction("TAP")) {
                handled = true;
                handleTap();
            }
            if (event.key.toUpperCase() === "-" && enableCardAction("NEW_COUNTER")) {
                handled = true;
                handleNewCounter();
            }
            if (event.key.toUpperCase() === "F" && enableCardAction("MOVE_TO_TOP_OF_LIBRARY")) {
                handled = true;
                handleMoveCardToTopOfLibrary();
            }
            if (event.key.toUpperCase() === "B" && enableCardAction("MOVE_TO_BOTTOM_OF_LIBRARY")) {
                handled = true;
                handleMoveCardToBottomOfLibrary();
            }
            if (event.key.toUpperCase() === "S" && enableCardAction("SEARCH")) {
                handled = true;
                handleSearch();
            }
        }

        if (handled) {
            event.preventDefault();
            return false;
        }
    }

    const deck = gameResource?.data();
    const card = deck?.cards.find(card => card.scryfallDetails.id === cardState.scryfallId);

    const token = cardState.tokenName ? playerState.tokenDefinitions.find(token => token.name === cardState.tokenName) : undefined;

    const possibleBucketsForCard = possibleBuckets([bucket, "scry", "library", "search"]);

    const focusStyle = focusing ? {outline: "unset"} : {};

    return (
        <Grid container sx={cardStyle}>
            <div style={{
                    position: "relative",
                    transform: cardState.tapped ? 'rotate(90deg)' : 'none',
                    ...focusStyle,
                }}
                onContextMenu={handleContextMenu}
                onClick={() => !hidden && setShowDetails(true)}
                onKeyDown={handleKeyPress}
                onMouseEnter={focusRef}
                onMouseMove={focusRef}
                onFocus={() => setFocusing(true)}
                onBlur={() => setFocusing(false)}
                tabIndex={-1}
                ref={myRef}
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

            {showDetails && <CardDetails
                cardState={cardState}
                card={card}
                bucket={bucket}
                playerState={playerState}
                onClose={() => setShowDetails(false)}
            />}

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
                {enableCardAction("TAP") && <MenuItem onClick={handleTap}>
                    <ListItemText>Tap/Untap</ListItemText>
                    <Typography variant="body2" color="text.secondary">T</Typography>
                </MenuItem>}
                {enableCardAction("NEW_COUNTER") && <MenuItem onClick={handleNewCounter}>
                    <ListItemText>New Counter</ListItemText>
                    <Typography variant="body2" color="text.secondary">-</Typography>
                </MenuItem>}
                {enableCardAction("MOVE_TO_TOP_OF_LIBRARY") && <MenuItem onClick={handleMoveCardToTopOfLibrary}>
                    <ListItemText>Front of Library</ListItemText>
                    <Typography variant="body2" color="text.secondary">F</Typography>
                </MenuItem>}
                {enableCardAction("MOVE_TO_BOTTOM_OF_LIBRARY") && <MenuItem onClick={handleMoveCardToBottomOfLibrary}>
                    <ListItemText>Back of Library</ListItemText>
                    <Typography variant="body2" color="text.secondary">B</Typography>
                </MenuItem>}
                {enableCardAction("SEARCH") && <MenuItem onClick={() => handleSearch()}>
                    <ListItemText>Search</ListItemText>
                    <Typography variant="body2" color="text.secondary">S</Typography>
                </MenuItem>}
                {enableCardAction("MOVE_TO_ZONE") && possibleBucketsForCard.map(bucket => (
                    <MenuItem key={bucket} onClick={() => handleMoveCard(bucket)}>
                        <ListItemText>Move to {bucket}</ListItemText>
                        <Typography variant="body2" color="text.secondary">⌘{bucket[0].toUpperCase()}</Typography>
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
        <Grid container sx={{
            ...cardStyle,
            borderColor: "#AAAAAA",
            color: "black",
            backgroundColor: "rgba(255, 255, 255, 0.6)",
        }}>
            Empty
        </Grid>
    );
}
