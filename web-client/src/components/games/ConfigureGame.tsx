import * as React from "react";

import {useDocument} from "react-firebase-hooks/firestore";

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { ChooseDeck } from "./ChooseDeck";

import {mutate} from "../../firebase-interop/baseModel";
import {addPlayerState, PlayerState} from "../../firebase-interop/models/playerState";
import {profileDoc} from "../../firebase-interop/models/profile";
import {addPlayerUserName, playerIsReady, isGameFull} from "../../firebase-interop/business-logic/game";
import type {Game} from "../../firebase-interop/models/game";


type Props = {
  game: Game,
  userId: string,
  onImReady: () => void,
};

export function ConfigureGame({game, userId, onImReady}: Props): React.ReactElement {
  const [newPlayerUserName, setPlayerUserName] = React.useState<string>("");
  const [selectedDeckId, setSelectedDeckId] = React.useState<string>("");

  const addPlayer = React.useCallback(async () => {
    await mutate(game, addPlayerUserName(newPlayerUserName));
    await addPlayerState(game.id!, newPlayerUserName, new PlayerState(game.id!, newPlayerUserName));
    setPlayerUserName("");
  }, [newPlayerUserName, game]);

  const imReady = React.useCallback(async () => {
    await mutate(game, playerIsReady(userId));
    onImReady();
  }, [userId, game, onImReady]);

  return (
    <Grid container
      columns={{ xs: 4, sm: 8, md: 12 }}
      justifyContent="center">
      <Grid xs={4} sm={4} md={4}>
        <Typography variant="h4" gutterBottom>Game {game.name}</Typography>

        {userId === game.ownerUserId ?
          <Accordion expanded={true}>
            <AccordionSummary>Players</AccordionSummary>
            <AccordionDetails>
                <Box component="form">
                    <Stack direction="column" spacing={2}>
                        {/**
                         * TODO(miguel): use magic table user handle rather
                         * then then user id.
                         */}
                        <TextField
                            value={newPlayerUserName}
                            onChange={e => setPlayerUserName(e.target.value)}
                            label="User Name"
                        />

                        <Button variant="outlined" disabled={!isGameFull(game)} onClick={addPlayer}>Add</Button>

                        <List>
                          {game.playersId.map(userId => (
                            <UserListItem key={userId} userId={userId} />
                          ))}
                        </List>
                      </Stack>

                </Box>
            </AccordionDetails>
          </Accordion> : null
        }

        <ChooseDeck game={game} uid={userId} onDeckSelected={setSelectedDeckId}/>
        {/**
         * TODO(miguel): this is a lil gross to have br here...  Change to use
         * padding.
         */}
        <br/>
        <Button variant="outlined" disabled={!selectedDeckId} onClick={imReady}>I am ready!</Button>
      </Grid>
    </Grid>
  );
}

function UserListItem({userId}: {
  userId: string,
}) {
  const [profileSnapshot] = useDocument(profileDoc(userId || ""));

  const profile = profileSnapshot?.data();
  const userName = profile?.userName ?? "Unknown";
  const description = profile?.description ?? "";

  return <ListItem sx={{backgroundColor: "#EEEEEE"}}>
      <ListItemText primary={userName} secondary={description} />
  </ListItem>;
}
