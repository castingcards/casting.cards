import ShuffleSeed from "shuffle-seed";

import type { Card } from "scryfall-sdk";
import { Deck, CardReference } from "../models/deck";

export function shuffle<T>(things: Array<T>): Array<T> {
    const shuffleSeed = Math.floor(Math.random() * 1000000);
    const shuffledThings: Array<T> = ShuffleSeed.shuffle(things, shuffleSeed);
    return shuffledThings;
}

export function pickBestPlaymat(deck: Deck): string {
    const colorMap: { [n: string]: boolean } = {};

    deck.cards.forEach(card => {
        card.scryfallDetails.color_identity.forEach(color => {
            colorMap[color] = true;
        });
    });

    const colors = Object.keys(colorMap);
    colors.sort();
    const colorCombo = colors.join("");

    const colorNames: {[key: string]: string} = {
      "B": "mono-black",
      "U": "mono-white",
      "G": "mono-green",
      "R": "mono-red",
      "W": "mono-white",
      "UW": "azorious",
      "RW": "boros",
      "BU": "dimir",
      "BG": "golgari",
      "GR": "gruul",
      "RU": "izzet",
      "BW": "orzhov",
      "BR": "rakdos",
      "GW": "selesnya",
      "GU": "simic",
      "BGW": "azban",
      "GUW": "bant",
      "BUW": "esper",
      "BRU": "grixis",
      "RUW": "jeskai",
      "BGR": "jund",
      "BRW": "mardu",
      "GRW": "naya",
      "BGU": "sultai",
      "GRU": "temur",
      "BGRU": "glint",
      "BGRW": "dune",
      "GRUW": "ink",
      "BGUW": "witch",
      "BRUW": "yore",
      "BGRUW": "wubrg",
    };

    const playmatName = colorNames[colorCombo] ?? "mono-white";

    return `/images/playmats/${playmatName}.webp`;
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

export async function getCardInDeck(deckId: string, scryfallCardId: string): Promise<CardReference | undefined> {
    const deck = await Deck.load(deckId);
    if (deck) {
        return deck.cards.find(card => card.scryfallDetails.id === scryfallCardId);
    }
    return undefined;
}