import * as React from "react";
import {useDocument} from "react-firebase-hooks/firestore";
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Typeogrophy from '@mui/material/Typography';

import {Card, EmptyCard, CARD_HEIGHT} from "./Card";
import {Library} from "./Library";

import {playerStateDoc, PlayerState, CARD_BUCKETS} from "../../firebase-interop/models/playerState";
import type {Game} from "../../firebase-interop/models/game";

type Props = {
    game: Game;
    uid: string;
}

function StackedCardsLayout({
    cardsId,
    title,
    playerState,
    bucket,
}: {
    cardsId: Array<string>,
    title: React.ReactNode,
    playerState: PlayerState,
    bucket: CARD_BUCKETS,
}) {
    const top = cardsId[cardsId.length - 1];

    return (
        <Grid container direction="column" alignItems="center">
            <Typeogrophy variant="body1">{title} ({cardsId.length})</Typeogrophy>
            <Grid container alignContent="center">
                <Grid>
                    {top ? <Card player={playerState} scryfallId={top} bucket={bucket} />: <EmptyCard/>}
                </Grid>
            </Grid>
        </Grid>
    );
}

function Exile({playerState}: {playerState: PlayerState}) {
    // TODO(miguel): wire in cards that are in the exile bucket
    const cardsId = playerState.exileCardIds;

    return (
        <StackedCardsLayout title="Exile" cardsId={cardsId} playerState={playerState} bucket="exile"/>
    );
}

function Graveyard({playerState}: {playerState: PlayerState}) {
    // TODO(miguel): wire in cards that are in the graveyard bucket
    const cardsId = playerState.graveyardCardIds;

    return (
        <StackedCardsLayout title="Graveyard" cardsId={cardsId} playerState={playerState} bucket="graveyard"/>
    );
}

// TODO(miguel): pull this out into a separate shareable component.
function calculateFishEye(
    hoveredItem: number,
    value: number,
    minSize: number = 1,

    // magFactor helps adjust how big/small the items should be.  With a value
    // of one, we will linearly scale item size depending on the itemCount.
    // Often you want to reduce the size of the cards, so provide a factor
    // smaller then 1. Perhaps we can add different scalers that arent linear.
    magFactor: number = 0.7,

    // How many items needs to be magnified where the center item has full
    // magnification. Usually when you increase the number of items that need
    // to be fish eye scaled you adjust the magFactor value so that items
    // aren't scaled up as itemCount is increased.
    itemCount: number = 3,
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
    return Math.max(minSize, magFactor * (itemCount - Math.pow(Math.abs(hoveredItem - value), 1/4)));
}

function ListCardsLayout({
    cardsId,
    bucket,
    title,
    playerState,
}: {
    cardsId: Array<string>,
    bucket: CARD_BUCKETS,
    title: React.ReactNode,
    playerState: PlayerState,
}) {
    const [hoveredItemIndex, setHoveredItemIndex] = React.useState(-1);
    // Half the card height is how much we have to translate cards so that
    // fish eye can scale cards while staying aligned to the bottom of the
    // card zone.
    const halfCardHeight = CARD_HEIGHT/2;
    return (
        <Grid container direction="column" alignItems="center">
            <Typeogrophy variant="body1">{title} ({cardsId.length})</Typeogrophy>
            <Grid container justifyContent="center" maxWidth="50vw" overflow="visible" flexWrap="nowrap">
                {cardsId.length ? cardsId.map((cardId, i) =>
                    <Grid
                        container
                        // +i keeps react happy when we render the same card more than once.
                        key={cardId+i}
                        justifyContent="center"
                        onMouseOver={() => {setHoveredItemIndex(i)}}
                        onMouseOut={() => {setHoveredItemIndex(-1)}}
                        sx={{
                            // TODO(miguel): perhaps make this configurable!
                            transform: `
                                translateY(${hoveredItemIndex !== -1 ? halfCardHeight - (halfCardHeight * calculateFishEye(hoveredItemIndex, i)): 0}px)
                                translateX(${hoveredItemIndex !== -1 ? cardsId.length * (i-hoveredItemIndex): 0}px)
                                scale(${hoveredItemIndex !== -1 ? calculateFishEye(hoveredItemIndex, i) : 1})
                            `,
                            // z index makes sure that cards where the mouse
                            // is hovering over are visible.
                            zIndex: hoveredItemIndex !== -1 ? 1000 - Math.abs(hoveredItemIndex - i) : undefined,
                        }}
                    >
                        <Card player={playerState} scryfallId={cardId} bucket={bucket} />
                    </Grid>
                ) : <EmptyCard/>}
            </Grid>
        </Grid>
    );
}

function Lands({playerState}: {playerState: PlayerState}) {
    const cardIds = playerState.landCardIds;
    return (
        <ListCardsLayout title="Lands" playerState={playerState} cardsId={cardIds} bucket="land"/>
    );
}

function Battleground({playerState}: {playerState: PlayerState}) {
    const cardIds = playerState.battlefieldCardIds;
    return (
        <ListCardsLayout title="Battleground" playerState={playerState} cardsId={cardIds} bucket="battlefield" />
    );
}

function Hand({playerState}: {playerState: PlayerState}) {
    const cardIds = playerState.handCardIds;
    return (
        <ListCardsLayout title="Hand" playerState={playerState} cardsId={cardIds} bucket="hand"/>
    );
}

export function GameBoard({game, uid}: Props) {
    const [playerStateDocReference, loading] = useDocument(playerStateDoc(game.id!)(uid));

    if (loading) {
        return <div>Loading...</div>;
    }

    const playerState = playerStateDocReference?.data();
    if (!playerState) {
        return <div>Bad bad.</div>;
    }

    // TODO(miguel): wire up custom layouts here where we can swap the
    // graveyard from left to right. And permanents from top to bottom.
    // This will be done by simply applying `row` or `row-reverse`
    // and `column` and `column-reverse` in the grid containers below.
    // For the graveyard and exile container, you can use column instead
    // of row and the will be aligned verically instead of horizontally.
    // We will wire this up later.
    const graveyardLayout = "column";
    const permanentCreaturesLayout = "column";

    return (
        <Grid container overflow="hidden" direction="column">
            <h1>{game.name}</h1>
            <Library game={game} player={playerState} />
            <Grid container
                direction="row"
                columns={{ xs: 4, sm: 8, md: 12 }}
            >
                <Grid container direction={graveyardLayout} width="200px" justifyContent="center" alignItems="center">
                    <Exile playerState={playerState}/>
                    <Divider sx={{width: "1em", visibility: "hidden"}}/>
                    <Graveyard playerState={playerState}/>
                </Grid>
                <Grid container direction="column" flex="1">
                    <Grid container direction={permanentCreaturesLayout} flex="1">
                        {/* Add option to disable a separate zone for lands
                        since not everyone will perhaps want that.  If the
                        lands zone is to not be rendered then the battlefield
                        will also take the space for lands.
                        */}
                        <Battleground playerState={playerState} />
                        <Lands playerState={playerState} />
                    </Grid>
                    <Hand playerState={playerState} />
                </Grid>
                <Grid container direction={graveyardLayout} width="200px" justifyContent="center" alignItems="center">
                </Grid>
            </Grid>
        </Grid>
    );
}
