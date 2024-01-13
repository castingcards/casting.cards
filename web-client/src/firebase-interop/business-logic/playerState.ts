
import {Deck} from '../models/deck';
import {PlayerState, CardState, CARD_BUCKETS} from '../models/playerState';
import {shuffle, allScryfallCards} from "./deck"

export function chooseDeck(deck: Deck) {
    return async function(playerState: PlayerState) {
        playerState = playerState.clone();
        const allScryfallIds = allScryfallCards(deck).map(card => card.id);
        const cardStates = allScryfallIds.map(scryfallCardId => {
            const cardNumber = playerState.nextCardId;
            playerState.nextCardId++;
            return newCardState(scryfallCardId, cardNumber);
        });

        playerState.deckId = deck.id!;
        playerState.cardIds = allScryfallIds;
        playerState.isReady = false;
        playerState.libraryCards = shuffle(cardStates);
        return playerState;
    }
}

export function drawCard() {
    return async function(playerState: PlayerState) {
        playerState = playerState.clone();
        const drawnCard = playerState.libraryCards.shift();
        if (drawnCard) {
            playerState.handCards.push(drawnCard!);
        }
        return playerState;
    };
}

export function moveCard(cardId: number, from: CARD_BUCKETS, to: CARD_BUCKETS) {
    return async function(playerState: PlayerState) {
        playerState = playerState.clone();

        let fromCardIndex: number = playerState[`${from}Cards`].findIndex(card => card.id == cardId);
        const cardToMove = playerState[`${from}Cards`][fromCardIndex];
        if (fromCardIndex < 0) {
            console.warn(`Card ${cardId} not found in ${from}`);
            return playerState;
        }

        playerState[`${from}Cards`].splice(fromCardIndex, 1);
        playerState[`${to}Cards`] = [...playerState[`${to}Cards`], cardToMove];
        return playerState;
    }
}

function newCardState(scryfallId: string, id: number, tapped: boolean = false): CardState {
    return {id, scryfallId, tapped};
}