import React from 'react';
import "./Login.css";
import { signIn, signOut, existingUser } from './signInFunctions';

export function Login() {
  const [user, setUser]: any = React.useState(existingUser);

  const handleLogin = React.useCallback(() => {
    signIn().then(setUser);
  }, []);

  if (user) {
    return (
      <div className="login-bar">
        <p>Welcome, {user.displayName}</p>
        <button onClick={() => {signOut(); setUser(null);}}>Log Out</button>
      </div>
    );
  }

  return (
    <div className="login-bar">
      <p>Log in to get started</p>
      <button onClick={handleLogin}>Log In</button>
    </div>
  );
}