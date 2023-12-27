import React from 'react';
import {useParams} from 'react-router-dom';


export function ViewGame() {
    const {gameId} = useParams();
    return (
        <div>
            <h1>View Game {gameId}</h1>
        </div>
    )
}