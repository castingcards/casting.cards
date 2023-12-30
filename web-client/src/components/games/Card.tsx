import React from "react";
import {useDocument} from 'react-firebase-hooks/firestore';

import Grid from '@mui/material/Unstable_Grid2';
import {deckDoc} from "../../firebase-interop/models/deck";

import type {PlayerState} from "../../firebase-interop/models/playerState";

type Props = {
    player: PlayerState;
    scryfallId: string;
}

function CardImageLayout({children}: {children: React.ReactNode}) {
    return (
        <Grid
            container
            width={80}
            height={120}
            justifyContent="center"
            alignContent="center"
            border="1px solid #AAAAAA"
            borderRadius="4px"
        >
            {children}
        </Grid>
    );
}

export function Card({player, scryfallId}: Props) {
    const [gameResource, loading, error] = useDocument(player.deckId ? deckDoc(player.deckId) : undefined);

    // TODO(miguel): figure out a good way to report errors.  We probably
    // don't want to just render an error string instead of a card.  Perhaps
    // we render a place holder card image instead.
    // Same for the loading state.
    if (error) {
        return <ErrorCard>{JSON.stringify(error)}</ErrorCard>;
    }

    if (loading) {
        return <LoadingCard/>
    }

    const deck = gameResource?.data();
    const card = deck?.cards.find(card => card.scryfallDetails.id === scryfallId);
    const imageUrl = card?.imageForCard();
    return (
        <CardImageLayout>
            <img src={imageUrl} alt={scryfallId} width={80} height={120} />
        </CardImageLayout>
    );
}

export function ErrorCard({children}: {children: React.ReactNode}) {
    // TODO(miguel): Add a better error card image
    return (
        <CardImageLayout>
            {children}
        </CardImageLayout>
    );
}

export function LoadingCard() {
    // TODO(miguel): Add a proper loading card image
    return (
        <CardImageLayout>Loading...</CardImageLayout>
    );
}

export function EmptyCard() {
    // TODO(miguel): Add a proper empty card image
    return (
        <CardImageLayout>Empty</CardImageLayout>
    );
}
