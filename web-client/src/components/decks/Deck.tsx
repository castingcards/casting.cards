import React from "react";
import {useParams} from 'react-router-dom';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';


import {doc} from 'firebase/firestore';
import {db, converter} from "../../firebase-interop/firebaseInit";

import {updateDeck, deckDoc} from "../../firebase-interop/models/deck";
import {useDocument} from 'react-firebase-hooks/firestore';

import type {Deck} from "../../firebase-interop/models/deck";
import type {Card as ScryfallCard} from "scryfall-sdk";

function canBeCommander(card: ScryfallCard): boolean {
    if (card.legalities.commander !== "legal") {
        return false;
    }

    if (card.type_line.includes("Legendary Creature")) {
        return true;
    }

    return false;
}

function isCommander(card: ScryfallCard, deck: Deck): boolean {
    return deck.commanderId === card.id;
}

export function ViewDeck() {
    const {deckId} = useParams();
    const [deck, loading] = useDocument(deckDoc(deckId || ""));

    const makeCommander = React.useCallback(
        (deck: Deck, card: ScryfallCard) => {
            console.log("Making commander", deck, card)
            if (deckId) {
                updateDeck(deckId, deck.withCommanderId(card.id))
            } else {
                // handle error... Must have a deckId.
            }
        },
        [deckId],
    );

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!deck) {
        return <div>Deck not found</div>;
    }

    const deckData = deck.data();
    if (!deckData) {
        return <div>Deck not found</div>;
    }

    const cards = deck.data()?.cards.filter(card => !!card) ?? [];
    const commanderCard = deckData.commanderId && cards.find(card => card.scryfallDetails.id === deckData.commanderId);
    if (commanderCard) {
        cards.splice(cards.indexOf(commanderCard), 1);
        cards.unshift(commanderCard);
    }

    return (
        <Box>
            <Typography variant="h2" gutterBottom>{deckData.name}</Typography>
            <Grid container spacing={2}>
                {cards.map(card => {
                    const cardIsCommander = isCommander(card.scryfallDetails, deckData);
                    const cardCanBeCommander = canBeCommander(card.scryfallDetails);
                    return (
                        <Grid item key={card.scryfallDetails.id} xs={6} sm={4} md={3} lg={2}>
                            <Card sx={{maxWidth: 300, backgroundColor: cardIsCommander ? "#AAA" : "white"}}>
                                <CardMedia
                                    component="img"
                                    image={card.scryfallDetails.image_uris?.normal}
                                    alt={card.scryfallDetails.name}
                                />
                                <CardContent>
                                    <Typography variant="h5">{card.scryfallDetails.name} ({card.count})</Typography>
                                    <Typography variant="body2">{card.scryfallDetails.type_line}</Typography>
                                    {cardIsCommander && <Typography variant="body2">COMMANDER</Typography>}
                                </CardContent>
                                <CardActions>
                                    {cardCanBeCommander && !cardIsCommander &&
                                        <Button
                                            size="small"
                                            onClick={() => makeCommander(deckData, card.scryfallDetails)}
                                        >
                                            Make Commander
                                        </Button>}
                                </CardActions>
                            </Card>
                        </Grid>
                )})}
            </Grid>
        </Box>
    );
}