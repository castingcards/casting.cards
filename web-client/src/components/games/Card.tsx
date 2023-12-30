import React from "react";
import {useDocument} from 'react-firebase-hooks/firestore';

import Paper from "@mui/material/Paper";
import {styled} from '@mui/material/styles';

import {deckDoc} from "../../firebase-interop/models/deck";

import type {PlayerState} from "../../firebase-interop/models/playerState";

type Props = {
    player: PlayerState;
    scryfallId: string;
}

const CardPaper = styled(Paper)(({ theme }) => ({
  width: 80,
  height: 120,
  padding: theme.spacing(2),
  ...theme.typography.body2,
  textAlign: 'center',
}));

export function Card({player, scryfallId}: Props) {
    const [gameResource, loading, error] = useDocument(player.deckId ? deckDoc(player.deckId) : undefined);

    if (error) {
        return <strong>Error: {JSON.stringify(error)}</strong>;
    }

    if (loading) {
        return <span>Loading Deck...</span>
    }

    const deck = gameResource?.data();
    const card = deck?.cards.find(card => card.scryfallDetails.id === scryfallId);
    const imageUrl = card?.imageForCard();
    return (
        <CardPaper variant="outlined">
            <img src={imageUrl} alt={scryfallId} width={80} height={120} />
        </CardPaper>
    );
}