import React from 'react';
import {useParams} from 'react-router-dom';

import {useDocument} from 'react-firebase-hooks/firestore';
import {gameDoc} from '../../firebase-interop/models/game';

import {auth} from '../../firebase-interop/firebaseInit';
import {useAuthState} from 'react-firebase-hooks/auth';

import {ChooseDeck} from './ChooseDeck';

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

    const myDeckId = game.getDeck(user.uid);
    if (!myDeckId) {
        return <ChooseDeck game={game} gameId={gameId} uid={user.uid} />;
    }

    return (
        <div>
            <h1>{game.name}</h1>
            <h2>{myDeckId}</h2>
        </div>
    )
}