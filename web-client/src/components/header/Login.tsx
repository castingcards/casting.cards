import React from 'react';

import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';


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

  let message = "";
  let authButton = null;

  if (loading) {
    message = "Loading...</p>";
  } else if (error) {
    message = `Error: ${error.message}`;
  } else if (user) {
    message = `Logged in as ${user.displayName}`;
    authButton = <Button color="inherit" onClick={() => signOut()}>Log Out</Button>;
  } else {
    message = "Log in to get started";
    authButton = <Button color="inherit" onClick={handleLogin}>Log In</Button>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>

          <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
          >
            {message}
          </Typography>

          {authButton}

        </Toolbar>
      </AppBar>
    </Box>
  );
}