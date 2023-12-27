import React from 'react';
import {useParams} from 'react-router-dom';

import {useDocument} from 'react-firebase-hooks/firestore';
import {gameDoc} from '../../firebase-interop/models/game';

export function ViewGame() {
    const {gameId} = useParams();
    const [game, loading] = useDocument(gameDoc(gameId || ""));

    if (loading) {
        return <div>Loading...</div>;
    }

    console.log("game", gameId, game?.data());

    const gameData = game?.data();
    if (!gameData) {
        return <div>Game not found</div>;
    }

    return (
        <div>
            <h1>View Game: {gameData.name}</h1>
        </div>
    )
}