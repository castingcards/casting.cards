import { GoogleAuthProvider, signInWithPopup, browserPopupRedirectResolver } from "firebase/auth";
import { auth } from "./firebaseInit";

const loginProvider = new GoogleAuthProvider();
loginProvider.setCustomParameters({
  prompt: "select_account"
});

// Create a function to handle Google sign in
const signInWithGoogle = async () => {
  try {
    const result: any = await signInWithPopup(auth, loginProvider, browserPopupRedirectResolver);
    console.log("RESULT", result)
    return result.user;
  } catch (error: any) {
    console.log("ERROR!!!", error);
  }
};

const signIn = async (): Promise<any> => {
  console.log("SIGN IN")
  return await signInWithGoogle();
}

export {
    signIn,
};