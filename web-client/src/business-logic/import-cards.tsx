import * as Scry from "scryfall-sdk";

import type {Card} from "scryfall-sdk";

import type { CardReference } from "../firebase-interop/models/deck";
const mtgDecklistParser = require("mtg-decklist-parser");

export async function importCardDetails(deckText: string): Promise<Array<CardReference>> {
    const parsed = new mtgDecklistParser.Decklist(deckText);
    const identifiers = parsed.deck.map((card: any) => {
        if (card.set && card.set.length >= 3 && card.set <= 6 && card.collectors) {
            return Scry.CardIdentifier.bySet(card.set, card.collectors);
        }

        return Scry.CardIdentifier.byName(card.name.split(" ()")[0]);
    });

    const cards = await Scry.Cards.collection(...identifiers).waitForAll();

    if (cards.not_found.length > 0) {
        console.log("Not found", cards.not_found);
    }

    return parsed.deck.map((card: any, i: number) => {
        const scryCard: Card = JSON.parse(JSON.stringify(cards[i]));
        return {
            count: card.amount,
            scryfallDetails: scryCard,
        }
    });
}