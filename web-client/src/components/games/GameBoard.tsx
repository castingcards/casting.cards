import * as React from "react";
import {useDocument} from "react-firebase-hooks/firestore";
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Typeogrophy from '@mui/material/Typography';

import {Card, EmptyCard} from "./Card";
import {Library} from "./Library";

import {playerStateDoc, PlayerState} from "../../firebase-interop/models/playerState";
import type {Game} from "../../firebase-interop/models/game";

type Props = {
    game: Game;
    uid: string;
}

function StackedCardsLayout({
    cardsId,
    title,
    playerState,
}: {
    cardsId: Array<string>,
    title: React.ReactNode,
    playerState: PlayerState,
}) {
    const top = cardsId[cardsId.length - 1];

    return (
        <Grid container direction="column" alignItems="center">
            <Typeogrophy variant="body1">{title} ({cardsId.length})</Typeogrophy>
            <Grid container alignContent="center">
                <Grid>
                    {top ? <Card player={playerState} scryfallId={top} />: <EmptyCard/>}
                </Grid>
            </Grid>
        </Grid>
    );
}

function Exile({playerState}: {playerState: PlayerState}) {
    // TODO(miguel): wire in cards that are in the exile bucket
    const cardsId = playerState.handCardIds;

    return (
        <StackedCardsLayout title="Exile" cardsId={cardsId} playerState={playerState}/>
    );
}

function Graveyard({playerState}: {playerState: PlayerState}) {
    // TODO(miguel): wire in cards that are in the graveyard bucket
    const cardsId = playerState.handCardIds;

    return (
        <StackedCardsLayout title="Graveyard" cardsId={cardsId} playerState={playerState}/>
    );
}

function ListCardsLayout({
    cardsId,
    title,
    playerState,
}: {
    cardsId: Array<string>,
    title: React.ReactNode,
    playerState: PlayerState,
}) {
    return (
        <Grid container direction="column" alignContent="center">
            <Typeogrophy variant="body1">{title} ({cardsId.length})</Typeogrophy>
            <Grid container justifyContent="center">
                {cardsId.length ? cardsId.map((cardId, i) =>
                    <Grid key={cardId} container justifyContent="center">
                        <Card player={playerState} scryfallId={cardId} />
                        {cardsId.length !== 1 && cardsId.length - 1 !== i ?
                            <Divider
                                sx={{width: "1em", visibility: "hidden"}}
                                orientation="horizontal"/> :
                            null
                        }
                    </Grid>
                ) : <EmptyCard/>}
            </Grid>
        </Grid>
    );
}

function Lands({playerState}: {playerState: PlayerState}) {
    // TODO(miguel): either add a new bucket in player state for lands or
    // out by card type. Needs to take into consideration any spells
    // that turn things into land.  We need to test if we want _all_ lands
    // or only lands that have a natural type of land.
    const cardIds = playerState.battlefieldCardIds;
    return (
        <ListCardsLayout title="Lands" playerState={playerState} cardsId={cardIds}/>
    );
}

function Battleground({playerState}: {playerState: PlayerState}) {
    const cardIds = playerState.battlefieldCardIds;
    return (
        <ListCardsLayout title="Battleground" playerState={playerState} cardsId={cardIds}/>
    );
}

function Hand({playerState}: {playerState: PlayerState}) {
    const cardIds = playerState.handCardIds;
    return (
        <ListCardsLayout title="Hand" playerState={playerState} cardsId={cardIds}/>
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
    const permanentCreaturesLayout = "column-reverse";

    return (
        <>
            <h1>{game.name}</h1>
            <Library game={game} player={playerState} />
            <Grid container
                direction="row"
                columns={{ xs: 4, sm: 8, md: 12 }}
                padding="0 2em"
            >
                <Grid container direction={graveyardLayout} justifyContent="center" alignItems="center">
                    <Exile playerState={playerState}/>
                    <Divider sx={{width: "1em", visibility: "hidden"}}/>
                    <Graveyard playerState={playerState}/>
                </Grid>
                <Grid container direction="column" flex="1">
                    <Grid container direction={permanentCreaturesLayout} flex="1">
                        <Lands playerState={playerState} />
                        <Battleground playerState={playerState} />
                    </Grid>
                    <Hand playerState={playerState} />
                </Grid>
            </Grid>
        </>
    );
}
