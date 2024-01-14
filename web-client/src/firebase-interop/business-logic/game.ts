
import {mutate} from "../baseModel"

import {Game} from "../models/game"
import {PlayerState, getPlayerState, getAllPlayerStates} from "../models/playerState";
import {Deck} from "../models/deck";

import {chooseDeck} from "../business-logic/playerState";

export function addPlayerId(userId: string) {
    return async function(game: Game) {
        if (game.state === "Finished") {
            throw new Error("Game is done.")
        }
        if (game.state === "Started") {
            throw new Error("Game is in progress.");
        }

        game = game.clone();
        if (game.playersId.indexOf(userId) === -1) {
            if (game.playersId.length >= game.maxPlayers) {
                throw new Error(`Can't add more player. Max is ${game.maxPlayers}.`);
            }

            game.playersId = [...game.playersId, userId];
        }
        return game;
    };
}

// Does not conform to the pattern yet.
export function setDeckForPlayer(playerState: PlayerState, deckId: string) {
    return async function(game: Game) {
        game = game.clone();

        if (game.state === "Finished") {
            throw new Error("Game is done.")
        }
        if (game.state === "Started") {
            throw new Error("Game is in progress.");
        }

        if (deckId) {
            const deck = await Deck.load(deckId);
            if (!deck) {
                throw new Error(`Deck ${deckId} not found`);
            }
            await mutate(playerState, chooseDeck(deck));
        }

        return addPlayerId(playerState.playerId)(game);
    };
}

export function playerIsReady(userId: string) {
    return async function(game: Game) {
        game = game.clone();
        if (game.state === "Finished") {
            throw new Error("Game is done.")
        }
        if (game.state === "Started") {
            throw new Error("Game is in progress.");
        }

        let playerState = await getPlayerState(game.id ?? "", userId);
        if (!playerState) {
           throw new Error("Must select a deck first");
        }

        playerState.isReady = true;
        playerState.save();

        const allPlayerStates = await getAllPlayerStates(game.id ?? "");
        game.state = allPlayerStates.every(p => p.isReady) ? "Started" : "Unstarted";
        return game;
    };
}

export function isGameFull(game: Game): boolean {
    return game.playersId.length < game.maxPlayers;
}