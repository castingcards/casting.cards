import React from 'react';
import { signIn, signOut, existingUser } from './signInFunctions';

export function Login() {
  const [user, setUser]: any = React.useState(existingUser);

  const handleLogin = React.useCallback(() => {
    signIn().then(setUser);
  }, []);

  if (user) {
    return (
      <div>
        <p>Welcome, {user.displayName} ({user.email})</p>
        <button onClick={() => {signOut(); setUser(null);}}>Log Out</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleLogin}>Log In</button>
    </div>
  );
}