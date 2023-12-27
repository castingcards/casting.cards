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

import {updateDeck, deckDoc} from "../../firebase-interop/models/deck";
import {useDocument} from 'react-firebase-hooks/firestore';

import {Deck} from "../../firebase-interop/models/deck";
import type {CardReference} from "../../firebase-interop/models/deck";

export function ViewDeck() {
    const {deckId} = useParams();
    const [deckSnapshot, loading] = useDocument(deckDoc(deckId || ""));

    const makeCommander = React.useCallback(
        (deck: Deck, card: CardReference) => {
            card.isCommander = true;
            if (deckId) {
                updateDeck(deckId, deck)
            } else {
                // handle error... Must have a deckId.
            }
        },
        [deckId],
    );

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!deckSnapshot) {
        return <div>Deck not found</div>;
    }

    const deck = deckSnapshot.data();
    if (!deck) {
        return <div>Deck not found</div>;
    }
    const cards = deck.cards.filter(card => !!card) ?? [];
    const commanderCards = cards.filter(card => card.isCommander);
    if (commanderCards.length >= 1) {
        commanderCards.forEach(commanderCard => {
            cards.splice(cards.indexOf(commanderCard), 1);
            cards.unshift(commanderCard);
        });
    }

    return (
        <Box>
            <Typography variant="h2" gutterBottom>{deck.name}</Typography>
            <Grid container spacing={2}>
                {cards.map(card => {
                    const cardCanBeCommander = card.canBeCommander();
                    return (
                        <Grid item key={card.scryfallDetails.id} xs={6} sm={4} md={3} lg={2}>
                            <Card sx={{maxWidth: 300, backgroundColor: card.isCommander ? "#AAA" : "white"}}>
                                <CardMedia
                                    component="img"
                                    image={card.scryfallDetails.image_uris?.normal}
                                    alt={card.scryfallDetails.name}
                                />
                                <CardContent>
                                    <Typography variant="h5">{card.scryfallDetails.name} ({card.count})</Typography>
                                    <Typography variant="body2">{card.scryfallDetails.type_line}</Typography>
                                    {card.isCommander && <Typography variant="body2">COMMANDER</Typography>}
                                </CardContent>
                                <CardActions>
                                    {cardCanBeCommander && !card.isCommander &&
                                        <Button
                                            size="small"
                                            onClick={() => makeCommander(deck, card)}
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