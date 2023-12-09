import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebaseInit";

export type User = {
  displayName: string;
  email: string;
  photoURL: string;
  uid: string;
  // Add other properties as needed
};

const loginProvider = new GoogleAuthProvider();
loginProvider.setCustomParameters({
  prompt: "select_account"
});

// Create a function to handle Google sign in
const signInWithGoogle = async () => {
  try {
    const result: any = await signInWithPopup(auth, loginProvider);
    return result.user;
  } catch (error: any) {
    console.log("ERROR!!!", error);
  }
};

const signIn = async (): Promise<User> => {
  const user = await signInWithGoogle();
  const strigifiedUser = JSON.stringify(user);
  localStorage.setItem('user', strigifiedUser);
  return JSON.parse(strigifiedUser);
}

const signOut = () => {
  localStorage.removeItem('user');
}

let existingUser: User | null = null;
const existingUserJSON = localStorage.getItem('user');
if (existingUserJSON) {
  existingUser = JSON.parse(existingUserJSON);
  console.log(existingUser);
}

export {
    signIn,
    signOut,
    existingUser,
};