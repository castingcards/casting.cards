import type {Card} from "scryfall-sdk";

// TODO(briang): Share models between backend and frontend.
export class CardReference {
  count: number;
  scryfallDetails: Card;
  isCommander: boolean;

  constructor(count: number, scryfallDetails: Card, isCommander = false) {
    this.count = count;
    this.scryfallDetails = scryfallDetails;
    this.isCommander = isCommander;
  }
}

export class Deck { // extends BaseModel {
  name: string;
  cards: Array<CardReference>;

  userId: string;
  source: string;

  constructor(name = "<unknown>", cards: Array<CardReference> = []) {
    // super();

    this.name = name;
    this.cards = cards;

    this.userId = "";
    this.source = "";
  }
}
