import * as archidekt from "./archidekt"
import {Deck} from "../firebase-interop/models/deck"

export async function fromUrl(deckURL: string): Promise<Deck> {
  if (archidekt.test(deckURL)) {
    return archidekt.getFromURL(deckURL);
  }

  throw new Error(`Unsupported URL: ${deckURL}`);
}

// TODO(miguel): Add an importer interface registration system.
// const _importers: Array<IImporter> = [];
// export function registerImporter(importer: IImporter) {
//   _importers.push(importerFunc);
// }
