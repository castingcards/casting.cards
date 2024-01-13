import ShuffleSeed from "shuffle-seed";

import type { Card } from "scryfall-sdk";
import { Deck } from "../models/deck";

export function shuffle<T>(things: Array<T>): Array<T> {
    const shuffleSeed = Math.floor(Math.random() * 1000000);
    const shuffledThings: Array<T> = ShuffleSeed.shuffle(things, shuffleSeed);
    return shuffledThings;
}

export function allScryfallCards(deck: Deck): Array<Card> {
    const cardList: Array<Card> = [];
    deck.cards.forEach((card) => {
      for (let i = 0; i < card.count; i++) {
        cardList.push(card.scryfallDetails);
      }
    });
    return cardList;
  }