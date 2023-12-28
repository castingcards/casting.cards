import React from "react";
import { useDocument } from "react-firebase-hooks/firestore";

import { ChooseDeck } from "./ChooseDeck";

import { deckDoc } from "../../firebase-interop/models/deck";
import type { Game } from "../../firebase-interop/models/game";

type Props = {
    gameId: string;
    game: Game;
    uid: string;
}

export function GameBoard({gameId, game, uid}: Props) {
    const player = game.getPlayer(uid);
    const [myDeckSnapshot, loading, error] = useDocument(player.deckId ? deckDoc(player.deckId) : null);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {JSON.stringify(error)}</div>;
    }

    if (!myDeckSnapshot) {
        return <ChooseDeck game={game} gameId={gameId} uid={uid} />;
    }

    //const myDeck = myDeckSnapshot.data();

    return (
        <div>
            <h1>{game.name}</h1>
            <h2>{myDeckSnapshot.id}</h2>
        </div>
    );
}