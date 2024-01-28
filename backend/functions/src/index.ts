/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onCall} from "firebase-functions/v2/https";
import admin from "firebase-admin";
// import * as logger from "firebase-functions/logger";

import {fromUrl} from "./deck-imports/from-url";

admin.initializeApp();

export const importFromURL = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("Authentication required");
  }

  const deck = await fromUrl(request.data);
  deck.userId = request.auth.uid;

  const deckObject = JSON.parse(JSON.stringify(deck));
  await admin.firestore().collection("decks").doc().create(deckObject);
  return "Success";
});
