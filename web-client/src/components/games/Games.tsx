import React from 'react';
import {Link} from 'react-router-dom';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import {auth} from "../../firebase-interop/firebaseInit";
import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollection} from 'react-firebase-hooks/firestore';

import {allGamesQuery} from '../../firebase-interop/models/game';

import {NewGame} from './NewGame';

export function Games() {
    const [user] = useAuthState(auth);
    const [games, loading, error] = useCollection(allGamesQuery());

    if (error) {
        return <strong>Error: {JSON.stringify(error)}</strong>;
    }

    if (loading) {
        return <span>Loading Games...</span>
    }

    if (!games) {
        return <span>No games found</span>;
    }

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems={"center"}
        >
        <Box sx={{maxWidth: 800}}>
            <Typography variant="h2" gutterBottom>Games</Typography>

            {user && <NewGame />}

            <Typography variant="h3">Here are your games!</Typography>
            <List>
                {games.docs.map(game => (
                    <ListItem key={game.id} sx={{backgroundColor: "#EEEEEE"}}>
                    <Link to={`/games/${game.id}`}>
                        <ListItemText primary={game.data().name} />
                    </Link>
                    </ListItem>)
                    )}
            </List>
        </Box>
    </Box>
    )
}