import * as React from "react";
import {DragDropContext} from "react-beautiful-dnd";

import {useDocument} from "react-firebase-hooks/firestore";
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Button from '@mui/material/Button';
import {createStyles} from "@mui/material";

import {Library} from "./Library";
import {PlayerBadge} from "./PlayerBadge";
import {NewToken} from "./NewToken";

import {mutate} from "../../firebase-interop/baseModel";
import {playerStateDoc, CARD_BUCKETS} from "../../firebase-interop/models/playerState";
import {untapAll, finishSearch, moveCard, reorderCard} from "../../firebase-interop/business-logic/playerState";

import type {Game} from "../../firebase-interop/models/game";
import {ShowStackModal} from "./ShowStack";
import { Exile } from "./GameZones";
import { Graveyard } from "./GameZones";
import { Lands } from "./GameZones";
import { Battleground } from "./GameZones";
import { Hand } from "./GameZones";
import { CommandZone } from "./GameZones";

import type {DropResult} from "react-beautiful-dnd";


type Props = {
    game: Game;
    uid: string;
    backgroundColor?: string;
}

function playmatStyle(playmat: String, color: String) {
    return createStyles({
        backgroundImage: `url("${playmat}")`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        borderRadius: 3,
        borderColor: color,
        borderWidth: 3,
        borderStyle: "solid",
    });
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

    const handleSearchClose = async () => {
        // We need to shuffle when the modal closes
        await mutate(playerState, finishSearch());
    };

    const handleUntapAll = async () => {
        await mutate(playerState, untapAll());
    };

    const handleDragEnd = async (result: DropResult) => {
        const {destination, source, draggableId} = result;

        if (!destination) {
            return;
        }

        if (destination.droppableId === source.droppableId &&
            destination.index === source.index) {
            return;
        }

        const cardId = parseInt(draggableId, 10);

        if (source.droppableId !== destination.droppableId) {
            // Moving cards between buckets
            mutate(playerState, moveCard(cardId, source.droppableId as CARD_BUCKETS, destination.droppableId as CARD_BUCKETS, destination.index));
        } else {
            // Reordering cards in the same bucket
            mutate(playerState, reorderCard(cardId, source.droppableId as CARD_BUCKETS, destination.index));
        }
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

    const showSearchModal = playerState.searchBucket !== undefined;

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Grid container direction="column" sx={playmatStyle(playerState.playmat, "black")}>
                <Grid container
                    direction="row"
                    columns={{ xs: 4, sm: 8, md: 12 }}
                >
                    <Grid container direction={graveyardLayout} width="200px" justifyContent="center" alignItems="center">
                        <PlayerBadge playerState={playerState} interactive={true}/>
                        <Exile playerState={playerState} interactive={true}/>
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
                            <Hand playerState={playerState} interactive={true} />
                        </Grid>
                    </Grid>
                    <Grid container direction={graveyardLayout} width="200px" justifyContent="center" alignItems="center">
                        <Button onClick={handleUntapAll} variant="outlined" sx={{
                            backgroundColor: "rgba(255, 255, 255, 0.6)",
                        }}>
                            Untap All
                        </Button>
                        <Divider sx={{width: "1em", height: "0.5em", visibility: "hidden"}}/>
                        <NewToken playerState={playerState} />
                        <Divider sx={{width: "1em", height: "0.5em", visibility: "hidden"}}/>
                        <Library game={game} player={playerState} interactive={true} />
                        <Divider sx={{width: "1em", height: "1em", visibility: "hidden"}}/>
                        <CommandZone playerState={playerState} interactive={true}/>
                    </Grid>
                    <Grid container direction={graveyardLayout} width="200px" justifyContent="center" alignItems="center">
                    </Grid>
                </Grid>
                {showSearchModal && <ShowStackModal
                    playerState={playerState}
                    cardStates={playerState.searchCards}
                    bucket={"search"}
                    open={showSearchModal}
                    onClose={handleSearchClose}
                />}
            </Grid>
        </DragDropContext>
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
        <DragDropContext onDragEnd={() => {}}>
            <Grid container direction="column" sx={playmatStyle(playerState.playmat, "gray")}>
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
        </DragDropContext>
    );
}
