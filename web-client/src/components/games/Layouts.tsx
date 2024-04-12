import * as React from "react";

import Grid from '@mui/material/Unstable_Grid2';
import Typeogrophy from '@mui/material/Typography';

import { Card, EmptyCard, CARD_HEIGHT } from "./Card";
import { zoneStyle } from "./GameZones";

import { PlayerState, CARD_BUCKETS, CardState } from "../../firebase-interop/models/playerState";

import type { CardAction } from "./Card";

export function ListCardsLayout({
    cardStates, bucket, title, playerState, hidden, interactive, cardActions,
}: {
    cardStates: Array<CardState>;
    bucket: CARD_BUCKETS;
    title: React.ReactNode;
    playerState: PlayerState;
    hidden?: boolean;
    interactive?: boolean;
    cardActions?: Array<CardAction>;
}) {
    const [hoveredItemIndex, setHoveredItemIndex] = React.useState(-1);
    // Half the card height is how much we have to translate cards so that
    // fish eye can scale cards while staying aligned to the bottom of the
    // card zone.
    const halfCardHeight = CARD_HEIGHT / 2;

    // TODO(miguel): perhaps make this configurable!
    const fishEyeTransform = (i: number) => {
        if (hidden) {
            return {};
        }

        return {
            transform: `
                translateY(${hoveredItemIndex !== -1 ? halfCardHeight - (halfCardHeight * calculateFishEye(hoveredItemIndex, i)) : 0}px)
                translateX(${hoveredItemIndex !== -1 ? cardStates.length * (i - hoveredItemIndex) : 0}px)
                scale(${hoveredItemIndex !== -1 ? calculateFishEye(hoveredItemIndex, i) : 1})
            `,
            zIndex: hoveredItemIndex !== -1 ? 1000 - Math.abs(hoveredItemIndex - i) : undefined,
        };
    };


    return (
        <Grid container direction="column" alignItems="center" sx={zoneStyle()}>
            <Typeogrophy variant="body1">{title} ({cardStates.length})</Typeogrophy>
            <Grid container justifyContent="center" maxWidth="50vw" overflow="visible" flexWrap="nowrap">
                {cardStates.length ? cardStates.map((cardState, i) => <Grid
                    container
                    // +i keeps react happy when we render the same card more than once.
                    key={cardState.id}
                    justifyContent="center"
                    onMouseOver={() => { !hidden && setHoveredItemIndex(i); }}
                    onMouseOut={() => { !hidden && setHoveredItemIndex(-1); }}
                    sx={fishEyeTransform(i)}
                >
                    <Card
                        playerState={playerState}
                        cardState={cardState}
                        bucket={bucket}
                        hidden={hidden}
                        interactive={interactive}
                        cardActions={cardActions ?? ["ALL"]} />
                </Grid>
                ) : <EmptyCard />}
            </Grid>
        </Grid>
    );
}export function StackedCardsLayout({
    cardStates, title, playerState, bucket, interactive, cardActions,
}: {
    cardStates: Array<CardState>;
    title: React.ReactNode;
    playerState: PlayerState;
    bucket: CARD_BUCKETS;
    interactive?: boolean;
    cardActions?: Array<CardAction>;
}) {
    const top = cardStates[cardStates.length - 1];

    return (
        <Grid container direction="column" alignItems="center" sx={zoneStyle()}>
            <Typeogrophy variant="body1">{title} ({cardStates.length})</Typeogrophy>
            <Grid container alignContent="center">
                <Grid>
                    {top ? <Card
                        playerState={playerState}
                        cardState={top}
                        bucket={bucket}
                        interactive={interactive}
                        cardActions={cardActions ?? ["ALL"]} /> : <EmptyCard />}
                </Grid>
            </Grid>
        </Grid>
    );
}

export function calculateFishEye(
    hoveredItem: number,
    value: number,
    minSize: number = 1,

    // magFactor helps adjust how big/small the items should be.  With a value
    // of one, we will linearly scale item size depending on the itemCount.
    // Often you want to reduce the size of the cards, so provide a factor
    // smaller then 1. Perhaps we can add different scalers that arent linear.
    magFactor: number = 1,

    // How many items needs to be magnified where the center item has full
    // magnification. Usually when you increase the number of items that need
    // to be fish eye scaled you adjust the magFactor value so that items
    // aren't scaled up as itemCount is increased.
    itemCount: number = 3
) {
    // I should really add a unit test for this.  But to test this manually,
    // you can type something like this in the browser console.
    //
    // const items = Array(30).fill(0).map((_, i) => i)
    // /* 12 below is the item that is hovered over. */
    // items.map((v, i) =>  v - 12).map(val => Math.max(1, (3 - Math.abs(val))))
    //
    // The actual formula is based on root numbers but formulated with
    // exponents because JS only provides up to the cubed root. We are using
    // thr fourth root because it gives a nice smoother transition of card
    // sizes from the current hovered card.
    return Math.max(minSize, magFactor * (itemCount - Math.pow(Math.abs(hoveredItem - value), 1 / 4)));
}

