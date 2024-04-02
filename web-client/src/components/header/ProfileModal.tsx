import React from "react";

import {useDocument} from 'react-firebase-hooks/firestore';

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Typeography from "@mui/material/Typography";

import {profileDoc, userNameExists, Profile} from "../../firebase-interop/models/profile";

import type {User} from "firebase/auth";

export default function ProfileModal({user, open, onClose}: {
    user: User,
    open: boolean,
    onClose: () => void,
}) {
    const [profileSnapshot, loading, error] = useDocument(profileDoc(user.uid || ""));

    if (error) {
        return <strong>Error: {JSON.stringify(error)}</strong>;
    }

    if (loading) {
        return <span>Loading profile...</span>
    }

    if (!profileSnapshot) {
        return <span>No profile found</span>;
    }

    const profile = profileSnapshot.data();
    if (!profile) {
        return <span>No profile found</span>;
    }

    return <ProfileDialog user={user} open={open} profile={profile} onClose={onClose} />;
}

function ProfileDialog({user, profile, open, onClose}: {
    user: User,
    profile: Profile,
    open: boolean,
    onClose: () => void,
}) {
    const [userName, setUserName] = React.useState(profile.userName);
    const [description, setDescription] = React.useState(profile.description);
    const [userNameExistsError, setUserNameExistsError] = React.useState(false);

    const handleUpdateProfile = async () => {
        setUserNameExistsError(false);

        if (profile.userName !== userName) {
            const exists = await userNameExists(userName);
            if (exists) {
                setUserNameExistsError(true);
                return;
            }
        }

        profile.userName = userName;
        profile.description = description;
        await profile.save();
        onClose();
    };

    const canEdit = !!userName;

    return <Dialog onClose={onClose} open={open}>
        <DialogTitle>New Token</DialogTitle>
        <Box component="form">
            <Grid container direction="row">
                <Grid item>
                    <Stack direction="column" spacing={2} padding={2} margin={2}>
                        <Typeography variant="body2">{user.uid}</Typeography>
                        <TextField id="user-name" label="User Name" variant="standard"
                            value={userName} onChange={e => setUserName(e.target.value)} />

                        <TextField id="user-bio" label="Bio" variant="standard"
                            value={description} onChange={e => setDescription(e.target.value)} />

                        {userNameExistsError && <Typeography variant={"body1"} color="red">Username exists</Typeography>}

                        <Button variant="outlined" onClick={handleUpdateProfile} disabled={!canEdit}>Update</Button>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    </Dialog>;
}