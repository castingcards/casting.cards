import * as React from "react";

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
import {addPlayerId, playerIsReady, isGameFull} from "../../firebase-interop/business-logic/game";
import type {Game} from "../../firebase-interop/models/game";


type Props = {
  game: Game,
  userId: string,
  onImReady: () => void,
};

export function ConfigureGame({game, userId, onImReady}: Props): React.ReactElement {
  const [newPlayerId, setNewPlayerId] = React.useState<string>("");
  const [selectedDeckId, setSelectedDeckId] = React.useState<string>("");

  const addPlayer = React.useCallback(async () => {
    await mutate(game, addPlayerId(newPlayerId));
    await addPlayerState(game.id!, newPlayerId, new PlayerState(game.id!, newPlayerId));
    setNewPlayerId("");
  }, [newPlayerId, game]);

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
                            value={newPlayerId} onChange={e => setNewPlayerId(e.target.value)}
                        />

                        <Button variant="outlined" disabled={!isGameFull(game)} onClick={addPlayer}>Add</Button>

                        <List>
                          {game.playersId.map(userId => (
                            <ListItem key={userId} sx={{backgroundColor: "#EEEEEE"}}>
                              <ListItemText primary={userId} />
                            </ListItem>)
                          )}
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
