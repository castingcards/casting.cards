import React from 'react';
import ReactDOM from 'react-dom';

import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import WidgetsIcon from '@mui/icons-material/Widgets';
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AccountCircle from '@mui/icons-material/AccountCircle';

import { useAuthState, useSignOut } from 'react-firebase-hooks/auth';

import {auth} from '../../firebase-interop/firebaseInit';
import {signIn} from '../../firebase-interop/signInFunctions';
import "./Header.css";

import type {User} from "firebase/auth"

export function Login() {
  const [user, loading, error] = useAuthState(auth);
  const [appMenuAnchorEl, setAppMenuAnchorEl] = React.useState<null | HTMLElement>(null);

  const openAppMenuButton = (evt: React.MouseEvent<HTMLElement>) => {
    setAppMenuAnchorEl(evt.currentTarget);
  };
  const closeAppMenuButton = () => {
    setAppMenuAnchorEl(null);
  };

  const handleLogin = React.useCallback(() => {
    signIn();
  }, []);

  let message = <div id="header-portal"></div>;
  let authButton = null;

  if (loading) {
    message = <div>Loading...</div>;
  } else if (error) {
    message = <div>Error: ${error.message}</div>;
  } else if (user) {
    authButton = <Profile user={user} />
  } else {
    message = <div>Log in to get started</div>;
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
              onClick={openAppMenuButton}
            >
            <MenuIcon />
          </IconButton>
          <Menu
              anchorEl={appMenuAnchorEl}
              open={!!appMenuAnchorEl}
              onClose={closeAppMenuButton}
              onClick={closeAppMenuButton}
            >
              <MenuItem onClick={closeAppMenuButton} sx={{ minWidth: 150 }}>
                <Link href="/decks" underline="none">
                  <ListItemIcon><WidgetsIcon fontSize="small"/></ListItemIcon>
                  Decks
                </Link>
              </MenuItem>
              <MenuItem onClick={closeAppMenuButton}>
                <Link href="/games" underline="none">
                  <ListItemIcon><PlayCircleOutlineIcon fontSize="small"/></ListItemIcon>
                  Games
                </Link>
              </MenuItem>
          </Menu>

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

export const HeaderPortal = ({
  message,
}: {
  message: string,
}) => {
  const [container] = React.useState(() => {
    const el = document.getElementById("header-portal");
    return el
  })

  return container ? ReactDOM.createPortal(message, container) : null;
}

function Profile({user}: {
  user: User,
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [signOut] = useSignOut(auth);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    signOut();
    handleClose();
  };

  return <>
      <Typography>{user.displayName}</Typography>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <AccountCircle />
      </IconButton>
      <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
      >
          <MenuItem onClick={handleSignOut}>Log Out</MenuItem>
      </Menu>
  </>;
}