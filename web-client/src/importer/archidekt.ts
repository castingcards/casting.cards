import * as Scry from "scryfall-sdk";

import {Deck, CardReference} from "../firebase-interop/models/deck";

// We use this pattern to match and extract the ID of the deck in archidekt
// so that we can call the correct endpoint to get all the cards in the
// deck.
const regexPattern = /https:\/\/www\.archidekt\.com\/decks\/(\d+)\/(\w*)/;

type archidektCard = {
  uid: string,
  oracleCard: {
    name: string,
  },
};

type archidektDeck = {
  name: string,
  categories: Array<{
    includedInDeck: boolean,
    name: string,
  }>,
  cards: Array<{
    quantity: number,
    categories: Array<string>,
    card: archidektCard,
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
    const archidektDeck: archidektDeck = await response.json();

    const categoriesToExclude = archidektDeck.categories.filter(({includedInDeck}) => {
      return !includedInDeck;
    }).map(({name}) => name);

    // Filter out the cards that are in the excluded categories.
    const filteredCards = archidektDeck.cards.filter(({categories}) => {
      return categoriesToExclude.every((category) => {
        return categories.indexOf(category) === -1;
      });
    });

    const identifiers = filteredCards.map(({card}) => {
      return Scry.CardIdentifier.byId(card.uid);
    });

    const cards = await Scry.Cards.collection(...identifiers).waitForAll();

    // The scry API gets really messy when cards that we request aren't found.
    // So we do a bit of extra work to ensure that we create arrays with
    // items in the proper order. Soo keep reading...
    //
    // Scry will return an array but the array is built only _with_ the cards
    // that exist in scry, so if cards we requests aren't in scry, those card
    // are skipped in the response array. And items in the array of ids that
    // we requested no longer match to the items in the array of cards returned
    // by scry. Consider a case where we request the following 4 cards:
    // [0: {id: 1}, 1: {id: 2}, 2: {id: 3}, 3: {id: 4}].
    // If id 3 is not found in scry then scry returns:
    // [0: {id: 1}, 1 :{id: 2}, 2: {id: 4}, "not_found": {id: 3}].
    // So when we iterate over arrays of cards we just need to make sure to
    // consider that indexes in array don't always match.  To address this,
    // we index scry cards by its ID so that we can then do a reverse lookup
    // without having to worry about array order or item positions.
    const scryCardsById = cards.reduce((collector: any, card, i) => {
      collector[card.id] = card;
      return collector;
    }, {});

    const cardReferences = filteredCards
      .filter((archidektCard) => {
        // TODO(miguel): instead of filtering bad cards out, return a place
        // holder ErrorCard with details about the error.  And allow users in
        // the UI to see these errors and allow them to fix the issue.
        const scryCard = scryCardsById[archidektCard.card.uid];
        if (!scryCard) {
          console.warn(
            `Card with id ${archidektCard.card.uid} not found in scry.
            "${archidektCard.card.oracleCard.name}"`);
        }
        return !!scryCard;
      })
      .map((archidektCard) => {
        const scryCard = scryCardsById[archidektCard.card.uid];
        if (scryCard.name !== archidektCard.card.oracleCard.name) {
          // This should ideally not happen.  But perhaps cards in scry and
          // archidekt are our of sync.  Best to at least report any
          // discrepancy we find.
          console.warn(
            `Card with id ${archidektCard.card.uid} don't match names.
            "${scryCard.name}". "${archidektCard.card.oracleCard.name}"`);
        }

        const isCommander = archidektCard.categories.indexOf("Commander") !== -1;
        return new CardReference(archidektCard.quantity, scryCard, isCommander);
      });

    return new Deck(archidektDeck.name, cardReferences);
  }

  test(deckURL: string): boolean {
    return regexPattern.test(deckURL);
  }
}
