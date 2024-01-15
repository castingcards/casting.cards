import React from 'react';
import {useParams} from 'react-router-dom';

import Grid from '@mui/material/Unstable_Grid2';

import {useDocument} from 'react-firebase-hooks/firestore';
import {gameDoc} from '../../firebase-interop/models/game';

import {auth} from '../../firebase-interop/firebaseInit';
import {useAuthState} from 'react-firebase-hooks/auth';

import {OpponentGameBoard, MyGameBoard} from './GameBoard';
import {ConfigureGame} from './ConfigureGame';

import {playerStateDoc} from '../../firebase-interop/models/playerState';
import type {Game} from '../../firebase-interop/models/game';

export function ViewGame() {
    const {gameId} = useParams();
    const [user] = useAuthState(auth);
    const [gameResource, loading] = useDocument(gameDoc(gameId || ""));

    if (!gameId) {
        return <div>Game not found</div>;
    }

    if (!user) {
        return <div>Must be logged in to view game</div>;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    const game = gameResource?.data();
    if (!game || !game.id) {
        return <div>Game not found</div>;
    }

    return <GameContent game={game} playerUserId={user.uid} />;
}

function GameContent({game, playerUserId}: {game: Game, playerUserId: string}) {
    const [playerStateResource, loading] = useDocument(playerStateDoc(game.id!)(playerUserId));

    if (loading) {
        return <div>Loading...</div>;
    }

    const playerState = playerStateResource?.data();
    if (!playerState) {
        return <div>PlayerState not found</div>;
    }

    if (!playerState?.isReady) {
        return <ConfigureGame game={game} userId={playerUserId} onImReady={() => {}}/>;
    }

    const opponentIds = game.playersId.filter(uid => uid !== playerUserId);
    console.log(game.playersId, opponentIds);
    const opponentUserId = opponentIds.length > 0 ? opponentIds[0] : playerUserId;

    return (
        <Grid container overflow="hidden" direction="column">
            <h1>{game.name}</h1>
            <OpponentGameBoard game={game} uid={opponentUserId} />
            <MyGameBoard game={game} uid={playerUserId} />
        </Grid>
    );
}