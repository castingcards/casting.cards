
import {Deck} from '../models/deck';
import {PlayerState, CardState} from '../models/playerState';
import {shuffle} from "./deck"


export function chooseDeck(deck: Deck) {
    return function(state: PlayerState) {
        const allCardIds = deck.allCards().map(card => card.id);
        const cardStates = allCardIds.map(scryfallCardId => {
            const cardNumber = state.nextCardId;
            incrementCardId()(state);
            return newCardState(scryfallCardId, cardNumber);
        });

        state.deckId = deck.id!;
        state.cardIds = allCardIds;
        state.isReady = false;
        state.libraryCards = shuffle(cardStates);
        return state;
    }
}

function incrementCardId() {
    return function(state: PlayerState) {
        state.nextCardId++;
        return state;
    }
}

function newCardState(scryfallId: string, id: number, tapped: boolean = false): CardState {
    return {id, scryfallId, tapped};
}