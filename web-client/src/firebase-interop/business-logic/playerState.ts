
import {Deck} from '../models/deck';
import {PlayerState, CardState, CARD_BUCKETS, ALL_CARD_BUCKETS, Token} from '../models/playerState';
import {shuffle, allScryfallCards} from "./deck"

export function findCardBucket(playerState: PlayerState, cardId: number): CARD_BUCKETS | undefined {
    for (const bucket of ALL_CARD_BUCKETS) {
        if (playerState[`${bucket}Cards`].find(card => card.id === cardId)) {
            return bucket;
        }
    }
}

export function chooseDeck(deck: Deck) {
    return async function(playerState: PlayerState) {
        playerState = playerState.clone();

        const commanderCardIDs = deck.cards.filter(card => card.isCommander).map(card => card.scryfallDetails.id);
        const allScryfallIds = allScryfallCards(deck).map(card => card.id);
        const cardStates = allScryfallIds.map(scryfallCardId => {
            const cardNumber = playerState.nextCardId;
            playerState.nextCardId++;
            const isCommander = commanderCardIDs.indexOf(scryfallCardId) !== -1;
            return newCardState(scryfallCardId, cardNumber, false, isCommander);
        });

        // pull all the commander card states out of the deck
        const commanderCardStates = cardStates.filter(card => card.isCommander);
        const nonCommanderCardStates = cardStates.filter(card => !card.isCommander);

        playerState.deckId = deck.id!;
        playerState.cardIds = allScryfallIds;
        playerState.isReady = false;
        playerState.libraryCards = shuffle(nonCommanderCardStates);
        playerState.commandzoneCards = commanderCardStates;
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

export function toggleTapped(cardId: number, value?: boolean) {
    return async function(playerState: PlayerState) {
        const bucket = findCardBucket(playerState, cardId);
        if (!bucket) {
            console.warn(`Card ${cardId} not found in any bucket`);
            return playerState;
        }


        let fromCardIndex: number = playerState[`${bucket}Cards`].findIndex(card => card.id == cardId);
        if (fromCardIndex < 0) {
            console.warn(`Card ${cardId} not found in ${bucket}`);
            return playerState;
        }

        playerState = playerState.clone();
        if (value !== undefined) {
            playerState[`${bucket}Cards`][fromCardIndex].tapped = value;
            return playerState;
        }

        playerState[`${bucket}Cards`][fromCardIndex].tapped = !playerState[`${bucket}Cards`][fromCardIndex].tapped;
        return playerState;
    }
}

export function untapAll() {
    return async function(playerState: PlayerState) {
        playerState = playerState.clone();
        for (const bucket of ALL_CARD_BUCKETS) {
            playerState[`${bucket}Cards`] = playerState[`${bucket}Cards`].map(card => {
                return {...card, tapped: false};
            });
        }
        return playerState;
    }
}

export function adjustLife(amount: number) {
    return async function(playerState: PlayerState) {
        playerState = playerState.clone();
        playerState.life += amount;
        return playerState;
    }
}

export function addTokenDefinition(token: Token) {
    return async function(playerState: PlayerState) {
        playerState = playerState.clone();
        playerState.tokenDefinitions.push(token);
        return playerState;
    }
}

export function addTokenToBattlefield(token: Token) {
    return async function(playerState: PlayerState) {
        playerState = playerState.clone();
        const cardNumber = playerState.nextCardId;
        playerState.nextCardId++;
        playerState.battlefieldCards.push(newCardState("", cardNumber, false, false, token.name));
        return playerState;
    }
}

function newCardState(
    scryfallId: string,
    id: number,
    tapped: boolean = false,
    isCommander: boolean = false,
    tokenName?: string,
): CardState {
    const state = {id, scryfallId, tapped, isCommander};
    if (tokenName) {
        return {...state, tokenName};
    }
    return state;
}