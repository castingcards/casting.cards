import React from "react";

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';

import { ChooseDeck } from "./ChooseDeck";

import type { Game } from "../../firebase-interop/models/game";


type Props = {
  game: Game,
  userId: string,
  onImReady: () => void,
};

export function ConfigureGame({game, userId, onImReady}: Props) {
  const [newPlayerId, setNewPlayerId] = React.useState<string>("");
  const [selectedDeckId, setSelectedDeckId] = React.useState<string>("");

  const addPlayer = React.useCallback(async () => {
    game.addPlayerId(newPlayerId);
    await game.save();
    setNewPlayerId("");
  }, [newPlayerId, game]);

  const imReady = React.useCallback(async () => {
    game.playerIsReady(userId);
    await game.save();
    onImReady();
  }, [userId, game, onImReady]);

  return (
    <Box
        display="flex"
        justifyContent="center"
        alignItems={"center"}
    >
      <Box
        sx={{maxWidth: 800}}>
        {userId === game.ownerUserId ?
          <Accordion expanded={true}>
            <AccordionSummary>Add Player</AccordionSummary>
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

                        <Button variant="outlined" disabled={!game.isGameFull()} onClick={addPlayer}>Add</Button>

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
        <br/>
        <Button variant="outlined" disabled={!selectedDeckId} onClick={imReady}>I am ready!</Button>
      </Box>
    </Box>
  );
}
