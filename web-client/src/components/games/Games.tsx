import * as React from 'react';
import {Link} from 'react-router-dom';

import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import {CenterLayout} from '../layouts/Center';

import {auth} from "../../firebase-interop/firebaseInit";
import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollection} from 'react-firebase-hooks/firestore';

import {myGamesQuery} from '../../firebase-interop/models/game';

import {NewGame} from './NewGame';

function GamesContent(): React.ReactElement {
    const [user] = useAuthState(auth);
    const [games, loading, error] = useCollection(myGamesQuery(user?.uid || ""));

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
        <>
            <Grid container justifyContent="space-between">
                <Typography variant="h4" gutterBottom>Games</Typography><small>{user?.uid}</small>
            </Grid>

            {user && <NewGame />}
            <List>
                {games.docs.map(game => (
                    <ListItem key={game.id} sx={{backgroundColor: "#EEEEEE"}}>
                    <Link to={`/games/${game.id}`}>
                        <ListItemText primary={game.data().name} />
                    </Link>
                    </ListItem>)
                    )}
            </List>
        </>
    );
}

export function Games(): React.ReactElement {
    return <CenterLayout><GamesContent/></CenterLayout>;
}
