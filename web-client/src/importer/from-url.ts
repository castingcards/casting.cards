import {ArchidektUrlImporter} from "./archidekt";
import {InfiniteTCGPlayerImporter} from "./infinite-tcgplayer";
import {Deck} from "../firebase-interop/models/deck";

export interface UrlImporter {
  test(url: string): boolean
  getFromURL(url: string): Promise<Deck>
}

const _importers: Array<UrlImporter> = [
  new ArchidektUrlImporter(),
  new InfiniteTCGPlayerImporter(),
];

export async function fromUrl(deckURL: string): Promise<Deck> {
  const importer = _importers.find(imp => imp.test(deckURL));

  if (!importer) {
    throw new Error(`Unsupported URL: ${deckURL}`);
  }

  return importer.getFromURL(deckURL);
}
