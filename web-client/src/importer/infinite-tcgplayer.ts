import * as Scry from "scryfall-sdk";

import {Deck, CardReference} from "../firebase-interop/models/deck";

const regexPattern = /^https:\/\/infinite\.tcgplayer\.com\/magic-the-gathering\/deck\/([^/]+)\/(\d+)/;

type infiniteDeck = {
  result: {
    deck: {
      format: string,
      name: string,
      subDecks: {
        maindeck: Array<{
          cardID: string,
          quantity?: number,
        }>,
        sideboard: Array<{
          cardID: string,
          quantity?: number,
        }>,
      },
    },
    cards: {
      [key: string]: {
        name: string,
        oracleID: string,
      },
    },
  },
};

// Imports from infinite tcgplayer.
// infinite tcgplayer can show magic the gathering decks!
// URLs for a deck and look something like:
// https://infinite.tcgplayer.com/magic-the-gathering/deck/Amalia-Combo/480413
//
// What we do is call the API the infinite tcgplayer calls to get all the
// details about a particular deck. You can see a sample response with a curl
// call like:
// curl https://infinite.tcgplayer.com/magic-the-gathering/deck/Amalia-Combo/480413
export class InfiniteTCGPlayerImporter {
  async getFromURL(deckURL: string): Promise<Deck> {
    const result = deckURL.match(regexPattern);
    if (result == null) {
      throw new Error(`Invalid archidekt URL: ${deckURL}`)
    }

    const response = await fetch(`https://infinite-api.tcgplayer.com/deck/magic/${result[2]}/?subDecks=true&cards=true`);
    const deckData: infiniteDeck = await response.json();

    const identifiers = Object.values(deckData.result.cards).map((card) => {
      return Scry.CardIdentifier.byOracleId(card.oracleID);
    });

    // Card count exists in a different map in the deck object called
    // subDecks.maindeck. That has an array of card IDs and count. We turn
    // that array into a map keys by the card ID to make it very easy to
    // get the card quantity when we are building a Deck object.
    const cardIDToQuantityMapping: { [key: string]: number } = {};
    deckData.result.deck.subDecks.maindeck.reduce((acc, next) => {
      acc[next.cardID] = next.quantity || 0;
      return acc;
    }, cardIDToQuantityMapping);

    const cards = await Scry.Cards.collection(...identifiers).waitForAll();
    const cardReferences = Object.keys(deckData.result.cards).map((cardKey: string, i) => {
      const card = deckData.result.cards[cardKey];

      if (cards[i].name !== card.name) {
        console.warn(
          `Card with id ${card.oracleID} don't match names.
          "${cards[i].name}". "${card.name}"`);
      }
      return new CardReference(cardIDToQuantityMapping[cardKey], cards[i])
    })

    return new Deck(deckData.result.deck.name, cardReferences, "");
  }

  test(deckURL: string): boolean {
    return regexPattern.test(deckURL);
  }
}
