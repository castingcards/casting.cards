
import type { Card } from "scryfall-sdk";

export function canBeCommander(scryfallDetails: Card): boolean {
    if (scryfallDetails.legalities.commander !== "legal") {
        return false;
    }

    if (scryfallDetails.type_line.includes("Legendary Creature")) {
        return true;
    }

    if (scryfallDetails.oracle_text?.toLowerCase().includes("can be your commander")) {
        return true;
    }

    return false;
}

export function imageForCard(scryfallDetails: Card) {
    const image_uris = scryfallDetails.image_uris
      ? scryfallDetails.image_uris
      : scryfallDetails.card_faces[0].image_uris;

    return image_uris?.normal || "";
}

export function transformOracleText(oracleText: string): string {
    return oracleText
      .replace(/\{T\}/g, "[TAP]")
      .replace(/\{C\}/g, "[Colorless]")
      .replace(/\{W\}/g, "[White]")
      .replace(/\{U\}/g, "[Blue]")
      .replace(/\{B\}/g, "[Black]")
      .replace(/\{R\}/g, "[Red]")
      .replace(/\{G\}/g, "[Green]");
}