import React from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { mutate } from "../../firebase-interop/baseModel";
import { PlayerState, ALL_COUNTER_LOCATIONS } from "../../firebase-interop/models/playerState";
import { addCounter } from "../../firebase-interop/business-logic/playerState";
import { Grid } from "@mui/material";

import type { COUNTER_LOCATION } from "../../firebase-interop/models/playerState";

export function NewCounterModal({playerState, cardId, open, onClose}: {
    playerState: PlayerState,
    cardId: number,
    open: boolean,
    onClose: () => void,
}) {
    const defaultPlacement = "middle";
    const [kind, setKind] = React.useState("+1/+1");
    const [count, setCount] = React.useState(1);
    const [placement, setPlacement] = React.useState<COUNTER_LOCATION>(defaultPlacement);

    const clearForm = () => {
        setKind("");
        setCount(0);
        setPlacement(defaultPlacement);
    }

    const handleAddCounter = async () => {
        await mutate(playerState, addCounter(cardId, kind, count, placement));
        clearForm();
        onClose();
    }

    return <Dialog onClose={onClose} open={open}>
        <DialogTitle>New Counter</DialogTitle>
        <Box component="form">
            <Grid container direction="row">
                <Grid item>
                    <Stack direction="column" spacing={2} padding={2} margin={2}>
                        <TextField id="counter-kind" label="Counter Kind" variant="standard"
                            value={kind} onChange={e => setKind(e.target.value)} />

                        <TextField id="counter-value" label="Initial Count" variant="standard" inputProps={{ type: 'number'}}
                            value={count} onChange={e => setCount(parseInt(e.target.value, 10))} />

                        <Select
                            id="counter-position"
                            value={placement}
                            label="Position"
                            onChange={e => setPlacement(e.target.value as COUNTER_LOCATION)}
                        >
                            {
                                ALL_COUNTER_LOCATIONS.map(location => <MenuItem key={location} value={location}>
                                    {location}
                                </MenuItem>)
                            }
                        </Select>

                        <Button variant="outlined" onClick={handleAddCounter}>Add Counter</Button>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    </Dialog>;
}