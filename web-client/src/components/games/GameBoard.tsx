import React from "react";

import { ChooseDeck } from "./ChooseDeck";

import type { Game } from "../../firebase-interop/models/game";

type Props = {
    gameId: string;
    game: Game;
    uid: string;
}

export function GameBoard({gameId, game, uid}: Props) {
    const myDeckId = game.getDeck(uid);
    if (!myDeckId) {
        return <ChooseDeck game={game} gameId={gameId} uid={uid} />;
    }

    // Load Decks from Firestore and start playing!

    return (
        <div>
            <h1>{game.name}</h1>
            <h2>{myDeckId}</h2>
        </div>
    );
}