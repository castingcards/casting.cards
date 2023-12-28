import React from 'react';
import {useParams} from 'react-router-dom';

import {useDocument} from 'react-firebase-hooks/firestore';
import {gameDoc} from '../../firebase-interop/models/game';

import {auth} from '../../firebase-interop/firebaseInit';
import {useAuthState} from 'react-firebase-hooks/auth';

import {GameBoard} from './GameBoard';

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
    if (!game) {
        return <div>Game not found</div>;
    }

    if (game.players.length < game.numPlayers) {
        return <div>Waiting for players...</div>;
    }

    return <GameBoard gameId={gameId} game={game} uid={user.uid} />;
}