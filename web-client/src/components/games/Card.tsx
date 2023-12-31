import React from "react";
import {useDocument} from 'react-firebase-hooks/firestore';

import Grid from '@mui/material/Unstable_Grid2';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {deckDoc} from "../../firebase-interop/models/deck";

import {ALL_CARD_BUCKETS} from "../../firebase-interop/models/playerState";
import type {PlayerState, CARD_BUCKETS} from "../../firebase-interop/models/playerState";

type Props = {
    player: PlayerState;
    scryfallId: string;
    bucket: CARD_BUCKETS;
}

function CardImageLayout({children}: {children: React.ReactNode}) {
    return (
        <Grid
            container
            width={80}
            height={120}
            justifyContent="center"
            alignContent="center"
            border="1px solid #AAAAAA"
            borderRadius="4px"
        >
            {children}
        </Grid>
    );
}

function possibleBuckets(bucket: CARD_BUCKETS): Array<CARD_BUCKETS> {
    // You can put a card anywhere but the current bucket
    const indexToRemove = ALL_CARD_BUCKETS.indexOf(bucket);
    return [
        ...ALL_CARD_BUCKETS.slice(0, indexToRemove),
        ...ALL_CARD_BUCKETS.slice(indexToRemove+1),
    ];
}


export function Card({player, scryfallId, bucket}: Props) {
    const [gameResource, loading, error] = useDocument(player.deckId ? deckDoc(player.deckId) : undefined);
    const [contextMenu, setContextMenu] = React.useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);

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

    const handleMoveCard = (location: CARD_BUCKETS) => {
        player.moveCard(scryfallId, bucket, location);
        player.save();
        setContextMenu(null);
    };

    const deck = gameResource?.data();
    const card = deck?.cards.find(card => card.scryfallDetails.id === scryfallId);
    const imageUrl = card?.imageForCard();
    const possibleBucketsForCard = possibleBuckets(bucket);
    return (
        <CardImageLayout>
            <img
                src={imageUrl}
                alt={scryfallId}
                width={80}
                height={120}
                style={{cursor: 'context-menu'}}
                onContextMenu={handleContextMenu}
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
                {possibleBucketsForCard.map(bucket => (
                    <MenuItem key={bucket} onClick={() => handleMoveCard(bucket)}>
                        Move to {bucket}
                    </MenuItem>
                ))}
            </Menu>
        </CardImageLayout>
    );
}

export function ErrorCard({children}: {children: React.ReactNode}) {
    // TODO(miguel): Add a better error card image
    return (
        <CardImageLayout>
            {children}
        </CardImageLayout>
    );
}

export function LoadingCard() {
    // TODO(miguel): Add a proper loading card image
    return (
        <CardImageLayout>Loading...</CardImageLayout>
    );
}

export function EmptyCard() {
    // TODO(miguel): Add a proper empty card image
    return (
        <CardImageLayout>Empty</CardImageLayout>
    );
}
