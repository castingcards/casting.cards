import React from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import { mutate } from "../../firebase-interop/baseModel";
import { PlayerState, Token } from "../../firebase-interop/models/playerState";
import { addTokenDefinition, addTokenToBattlefield } from "../../firebase-interop/business-logic/playerState";
import { Grid } from "@mui/material";

export function NewToken({playerState}: {playerState: PlayerState}) {
    const [open, setOpen] = React.useState(false);
    return <div>
        <Button variant="outlined" onClickCapture={() => setOpen(true)} sx={{
            backgroundColor: "rgba(255, 255, 255, 0.6)",
        }}>
            Add Token
        </Button>
        {open && <NewTokenModal playerState={playerState} open={open} onClose={() => setOpen(false)} />}
    </div>;
}

function NewTokenModal({playerState, open, onClose}: {
    playerState: PlayerState,
    open: boolean,
    onClose: () => void,
}) {
    const [name, setName] = React.useState("");
    const [abilities, setAbilities] = React.useState("");
    const [power, setPower] = React.useState(0);
    const [toughness, setToughness] = React.useState(0);

    const clearForm = () => {
        setName("");
        setAbilities("");
        setPower(0);
        setToughness(0);
    }

    const handleAddTokenWithDefinition = async () => {
        const token = {
            name,
            abilities,
            power,
            toughness,
        };

        await mutate(playerState, addTokenDefinition(token), addTokenToBattlefield(token));
        clearForm();
        onClose();
    };

    const handleAddTokenFromDefinition = async (token: Token) => {
        await mutate(playerState, addTokenToBattlefield(token));
        clearForm();
        onClose();
    }

    const tokenDefinitions = playerState.tokenDefinitions ?? [];

    return <Dialog onClose={onClose} open={open}>
        <DialogTitle>New Token</DialogTitle>
        <Box component="form">
            <Grid container direction="row">
                <Grid item>
                    {tokenDefinitions.length > 0 && <Stack direction="column" spacing={2} padding={2} margin={2}>
                        {tokenDefinitions.map(token => <Button variant="outlined" key={token.name} onClick={() => {
                            handleAddTokenFromDefinition(token);
                        }}>{token.name}</Button>)}
                    </Stack>}
                </Grid>
                <Grid item>
                    <Stack direction="column" spacing={2} padding={2} margin={2}>
                        <TextField id="token-name" label="Token Name" variant="standard"
                            value={name} onChange={e => setName(e.target.value)} />

                        <TextField id="token-abilities" label="Token Abilities" variant="standard"
                            value={abilities} onChange={e => setAbilities(e.target.value)} />

                        <TextField id="token-power" label="Token Power" variant="standard" inputProps={{ type: 'number'}}
                            value={power} onChange={e => setPower(parseInt(e.target.value, 10))} />

                        <TextField id="token-toughness" label="Token Toughness" variant="standard" inputProps={{ type: 'number'}}
                            value={toughness} onChange={e => setToughness(parseInt(e.target.value, 10))} />

                        <Button variant="outlined" onClick={handleAddTokenWithDefinition}>Add Token</Button>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    </Dialog>;
}