import * as Scry from "scryfall-sdk";

import {Deck, CardReference} from "../firebase-interop/models/deck";

const mtgDecklistParser = require("mtg-decklist-parser");

export async function fromText(deckText: string): Promise<Deck> {
    const parsed = new mtgDecklistParser.Decklist(deckText);
    const identifiers = parsed.deck.map((card: any) => {
        if (card.set && card.set.length >= 3 && card.set.length <= 6 && card.collectors) {
            return Scry.CardIdentifier.bySet(card.set, card.collectors);
        }

        return Scry.CardIdentifier.byName(card.name.split(" ()")[0]);
    });

    const cards = await Scry.Cards.collection(...identifiers).waitForAll();

    if (cards.not_found.length > 0) {
        console.log("Not found", cards.not_found);
    }

    return new Deck(
        "",
        parsed.deck.map((card: any, i: number) => {
            return new CardReference(card.amount, cards[i]);
        }),
    );
}
