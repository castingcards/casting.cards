import React from 'react';
import { useAuthState, useSignOut } from 'react-firebase-hooks/auth';

import {auth} from '../../firebase-interop/firebaseInit';
import {signIn} from '../../firebase-interop/signInFunctions';
import "./Login.css";

console.log("Login.tsx: auth", auth);
export function Login() {
  const [user, loading, error] = useAuthState(auth);
  const [signOut] = useSignOut(auth);

  const handleLogin = React.useCallback(() => {
    signIn();
  }, []);

  if (loading) {
    return <div className="login-bar">
      <p> </p>
    </div>;
  }

  if (error) {
    console.error("Login.tsx: error", error);
  }

  if (user) {
    return (
      <div className="login-bar">
        <p>Logged In: {user.displayName}</p>
        <button onClick={() => signOut()}>Log Out</button>
      </div>
    );
  }

  return (
    <div className="login-bar">
      <p>Log in to get started</p>
      <button onClick={handleLogin}>Log In
      </button>
    </div>
  );
}