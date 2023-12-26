import * as Scry from "scryfall-sdk";

import {Deck, CardReference} from "../firebase-interop/models/deck";

// We use this pattern to match and extract the ID of the deck in archidekt
// so that we can call the correct endpoint to get all the cards in the
// deck.
const regexPattern = /https:\/\/www\.archidekt\.com\/decks\/(\d+)\/(\w*)/;

type archidektDeck = {
  name: string,
  cards: Array<{
    quantity: number,
    card: {
      uid: string,
      oracleCard: {
        name: string,
      },
    },
  }>,
};

// Imports from archidekt.
// archidekt does not currently have a documented API, but they do have one.
// You can see details about it here https://archidekt.com/forum/thread/40353/1
// If you would like to see results from the API yourself, you can use curl
// E.g.
// curl https://archidekt.com/api/decks/6221548/
// Where 6221548 is the ID from the deck when you are looking at archidekt
// deck https://www.archidekt.com/decks/6221548/rin_and_seri_cat_tribal_edh
export class ArchidektUrlImporter {
  async getFromURL(deckURL: string): Promise<Deck> {
    const result = deckURL.match(regexPattern);
    if (result == null) {
      throw new Error(`Invalid archidekt URL: ${deckURL}`)
    }

    const response = await fetch(`https://archidekt.com/api/decks/${result[1]}/`);
    const deckData: archidektDeck = await response.json();

    const identifiers = deckData.cards.map(({card}) => {
      return Scry.CardIdentifier.byId(card.uid);
    });

    const cards = await Scry.Cards.collection(...identifiers).waitForAll();
    const cardReferences = deckData.cards.map((cardmeta, i) => {
      if (cards[i].name !== cardmeta.card.oracleCard.name) {
        console.warn(
          `Card with id ${cardmeta.card.uid} don't match names.
          "${cards[i].name}". "${cardmeta.card.oracleCard.name}"`);
      }
      return new CardReference(cardmeta.quantity, cards[i])
    })

    return new Deck(deckData.name, cardReferences, "");
  }

  test(deckURL: string): boolean {
    return regexPattern.test(deckURL);
  }
}
