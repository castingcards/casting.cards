import {signInWithGoogle} from './firebaseInit';

export type User = {
  displayName: string;
  email: string;
  photoURL: string;
  uid: string;
  // Add other properties as needed
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
}

export {
    signIn,
    signOut,
    existingUser,
};