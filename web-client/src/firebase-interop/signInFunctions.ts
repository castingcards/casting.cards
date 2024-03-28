import { GoogleAuthProvider, signInWithPopup, browserPopupRedirectResolver } from "firebase/auth";
import { auth } from "./firebaseInit";
import { getOrCreateProfile } from "./models/profile";

import type {User} from "firebase/auth";

const loginProvider = new GoogleAuthProvider();
loginProvider.setCustomParameters({
  prompt: "select_account"
});

// Create a function to handle Google sign in
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, loginProvider, browserPopupRedirectResolver);
    return result.user;
  } catch (error) {
    console.log("ERROR!!!", error);
  }
};

const signIn = async (): Promise<User | undefined> => {
  const user = await signInWithGoogle();

  if (user) {
    await getOrCreateProfile(user.uid, user.displayName ?? "");
  }

  return user;
}

export {
    signIn,
};