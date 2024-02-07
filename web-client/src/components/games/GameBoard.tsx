import * as React from "react";
import {useDocument} from "react-firebase-hooks/firestore";
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Typeogrophy from '@mui/material/Typography';
import Button from '@mui/material/Button';

import {Card, EmptyCard, CARD_HEIGHT} from "./Card";
import {Library} from "./Library";
import {PlayerBadge} from "./PlayerBadge";
import {NewToken} from "./NewToken";

import {mutate} from "../../firebase-interop/baseModel";
import {playerStateDoc, PlayerState, CARD_BUCKETS, CardState} from "../../firebase-interop/models/playerState";
import {untapAll} from "../../firebase-interop/business-logic/playerState";

import type {Game} from "../../firebase-interop/models/game";
import type {CardAction} from "./Card";

type Props = {
    game: Game;
    uid: string;
    backgroundColor?: string;
}

function StackedCardsLayout({
    cardStates,
    title,
    playerState,
    bucket,
    interactive,
    cardActions,
}: {
    cardStates: Array<CardState>,
    title: React.ReactNode,
    playerState: PlayerState,
    bucket: CARD_BUCKETS,
    interactive?: boolean,
    cardActions?: Array<CardAction>,
}) {
    const top = cardStates[cardStates.length - 1];

    return (
        <Grid container direction="column" alignItems="center">
            <Typeogrophy variant="body1">{title} ({cardStates.length})</Typeogrophy>
            <Grid container alignContent="center">
                <Grid>
                    {top ? <Card playerState={playerState} cardState={top} bucket={bucket} interactive={interactive} cardActions={cardActions ?? ["ALL"]} />: <EmptyCard/>}
                </Grid>
            </Grid>
        </Grid>
    );
}

function Exile({playerState, interactive}: {
    playerState: PlayerState,
    interactive?: boolean,
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
            cardActions={["MOVE_TO_ZONE"]}
        />
    );
}

function Graveyard({playerState, interactive}: {
    playerState: PlayerState,
    interactive?: boolean,
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
            cardActions={["MOVE_TO_ZONE"]}
        />
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

export function ListCardsLayout({
    cardStates,
    bucket,
    title,
    playerState,
    hidden,
    interactive,
    cardActions,
}: {
    cardStates: Array<CardState>,
    bucket: CARD_BUCKETS,
    title: React.ReactNode,
    playerState: PlayerState,
    hidden?: boolean,
    interactive?: boolean,
    cardActions?: Array<CardAction>,
}) {
    const [hoveredItemIndex, setHoveredItemIndex] = React.useState(-1);
    // Half the card height is how much we have to translate cards so that
    // fish eye can scale cards while staying aligned to the bottom of the
    // card zone.
    const halfCardHeight = CARD_HEIGHT/2;

    // TODO(miguel): perhaps make this configurable!
    const fishEyeTransform = (i: number) => {
        if (hidden) {
            return {};
        }

        return {
            transform: `
                translateY(${hoveredItemIndex !== -1 ? halfCardHeight - (halfCardHeight * calculateFishEye(hoveredItemIndex, i)): 0}px)
                translateX(${hoveredItemIndex !== -1 ? cardStates.length * (i-hoveredItemIndex): 0}px)
                scale(${hoveredItemIndex !== -1 ? calculateFishEye(hoveredItemIndex, i) : 1})
            `,
            zIndex: hoveredItemIndex !== -1 ? 1000 - Math.abs(hoveredItemIndex - i) : undefined,
        };
    };


    return (
        <Grid container direction="column" alignItems="center">
            <Typeogrophy variant="body1">{title} ({cardStates.length})</Typeogrophy>
            <Grid container justifyContent="center" maxWidth="50vw" overflow="visible" flexWrap="nowrap">
                {cardStates.length ? cardStates.map((cardState, i) =>
                    <Grid
                        container
                        // +i keeps react happy when we render the same card more than once.
                        key={cardState.id}
                        justifyContent="center"
                        onMouseOver={() => {!hidden && setHoveredItemIndex(i)}}
                        onMouseOut={() => {!hidden && setHoveredItemIndex(-1)}}
                        sx={fishEyeTransform(i)}
                    >
                        <Card playerState={playerState} cardState={cardState} bucket={bucket} hidden={hidden} interactive={interactive} cardActions={cardActions ?? ["ALL"]} />
                    </Grid>
                ) : <EmptyCard/>}
            </Grid>
        </Grid>
    );
}

function Lands({playerState, interactive}: {
    playerState: PlayerState,
    interactive?: boolean,
}) {
    const cards = playerState.landCards;
    return (
        <ListCardsLayout title="Lands" playerState={playerState} cardStates={cards} bucket="land" interactive={interactive}/>
    );
}

function Battleground({playerState, interactive}: {
    playerState: PlayerState,
    interactive?: boolean,
}) {
    const cards = playerState.battlefieldCards;
    return (
        <ListCardsLayout title="Battleground" playerState={playerState} cardStates={cards} bucket="battlefield" interactive={interactive} />
    );
}

function Hand({playerState, opponent, interactive}: {
    playerState: PlayerState,
    opponent?: boolean,
    interactive?: boolean,
}) {
    const cards = playerState.handCards;
    return (
        <ListCardsLayout title="Hand" playerState={playerState} cardStates={cards} hidden={opponent} bucket="hand" interactive={interactive}/>
    );
}

function CommandZone({playerState, interactive}: {
    playerState: PlayerState,
    interactive?: boolean,
}) {
    const cards = playerState.commandzoneCards;
    return (
        <ListCardsLayout title="Command Zone" playerState={playerState} cardStates={cards} bucket="commandzone" interactive={interactive}/>
    );
}

export function MyGameBoard({game, uid}: Props) {
    const [playerStateDocReference, loading] = useDocument(playerStateDoc(game.id!)(uid));

    if (loading) {
        return <div>Loading...</div>;
    }

    const playerState = playerStateDocReference?.data();
    if (!playerState) {
        return <div>Bad bad.</div>;
    }

    const handleUntapAll = async () => {
        await mutate(playerState, untapAll());
    };

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
        <Grid container overflow="hidden" direction="column" sx={{backgroundColor: "#DFFFFF"}}>
            <Grid container
                direction="row"
                columns={{ xs: 4, sm: 8, md: 12 }}
            >
                <Grid container direction={graveyardLayout} width="200px" justifyContent="center" alignItems="center">
                    <PlayerBadge playerState={playerState} interactive={true}/>
                    <Button onClick={handleUntapAll}>Untap All</Button>
                    <Exile playerState={playerState} interactive={true}/>
                    <Divider sx={{width: "1em", visibility: "hidden"}}/>
                    <Graveyard playerState={playerState} interactive={true}/>
                </Grid>
                <Grid container direction="column" flex="1">
                    <Grid container direction={permanentCreaturesLayout} flex="1">
                        {/* Add option to disable a separate zone for lands
                        since not everyone will perhaps want that.  If the
                        lands zone is to not be rendered then the battlefield
                        will also take the space for lands.
                        */}
                        <Battleground playerState={playerState} interactive={true}/>
                        <Lands playerState={playerState} interactive={true} />
                    </Grid>
                    <Hand playerState={playerState} interactive={true} />
                </Grid>
                <Grid container direction={graveyardLayout} width="200px" justifyContent="center" alignItems="center">
                    <NewToken playerState={playerState} />
                    <Library game={game} player={playerState} interactive={true} />
                    <Divider sx={{width: "1em", visibility: "hidden"}}/>
                    <CommandZone playerState={playerState} interactive={true}/>
                </Grid>
                <Grid container direction={graveyardLayout} width="200px" justifyContent="center" alignItems="center">
                </Grid>
            </Grid>
        </Grid>
    );
}

export function OpponentGameBoard({game, uid}: Props) {
    const [playerStateDocReference, loading] = useDocument(playerStateDoc(game.id!)(uid));

    if (loading) {
        return <div>Loading...</div>;
    }

    const playerState = playerStateDocReference?.data();
    if (!playerState) {
        return <div>Bad bad.</div>;
    }

    const graveyardLayout = "column";
    const permanentCreaturesLayout = "column";

    return (
        <Grid container overflow="hidden" direction="column">
            <Grid container
                direction="row"
                columns={{ xs: 4, sm: 8, md: 12 }}
            >
                <Grid container direction={graveyardLayout} width="200px" justifyContent="center" alignItems="center">
                    <PlayerBadge playerState={playerState}/>
                    <Exile playerState={playerState}/>
                    <Divider sx={{width: "1em", visibility: "hidden"}}/>
                    <Graveyard playerState={playerState}/>
                </Grid>
                <Grid container direction="column" flex="1">
                    <Hand playerState={playerState} opponent={true} />
                    <Grid container direction={permanentCreaturesLayout} flex="1">
                        <Lands playerState={playerState} />
                        <Battleground playerState={playerState} />
                    </Grid>
                </Grid>
                <Grid container direction={graveyardLayout} width="200px" justifyContent="center" alignItems="center">
                    <Library game={game} player={playerState} />
                    <Divider sx={{width: "1em", visibility: "hidden"}}/>
                    <CommandZone playerState={playerState}/>
                </Grid>
                <Grid container direction={graveyardLayout} width="200px" justifyContent="center" alignItems="center">
                </Grid>
            </Grid>
        </Grid>
    );
}
