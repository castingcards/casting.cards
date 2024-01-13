
import {Deck} from '../models/deck';
import {PlayerState, CardState} from '../models/playerState';
import {shuffle, allScryfallCards} from "./deck"


export function chooseDeck(deck: Deck) {
    return function(state: PlayerState) {
        state = state.clone();
        const allScryfallIds = allScryfallCards(deck).map(card => card.id);
        const cardStates = allScryfallIds.map(scryfallCardId => {
            const cardNumber = state.nextCardId;
            state = incrementCardId()(state);
            return newCardState(scryfallCardId, cardNumber);
        });

        state.deckId = deck.id!;
        state.cardIds = allScryfallIds;
        state.isReady = false;
        state.libraryCards = shuffle(cardStates);
        return state;
    }
}

function incrementCardId() {
    return function(state: PlayerState) {
        state = state.clone();
        state.nextCardId++;
        return state;
    }
}

function newCardState(scryfallId: string, id: number, tapped: boolean = false): CardState {
    return {id, scryfallId, tapped};
}