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
import {useDocument} from 'react-firebase-hooks/firestore';
import {db} from "../../firebase-interop/firebaseInit";
import {updateDeck} from "../../firebase-interop/models/deck";

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
    const { deckId } = useParams();
    const [value, loading] = useDocument(doc(db, "decks", deckId || ""));

    const makeCommander = React.useCallback(
        (deck: Deck, card: ScryfallCard) => updateDeck({
            ...deck,
            commanderId: card.id,
        }),
        []
    );

    if (loading) {
        return <div>Loading...</div>;
    }

    const deck = value?.data() as Deck | undefined;
    if (!deck) {
        return <div>Deck not found</div>;
    }
    deck.id = value?.id;

    console.log("deck", deck)

    const cards = deck.cards.filter(card => !!card) ?? [];
    const commanderCard = deck.commanderId && cards.find(card => card.scryfallDetails.id === deck.commanderId);
    if (commanderCard) {
        cards.splice(cards.indexOf(commanderCard), 1);
        cards.unshift(commanderCard);
    }

    return (
        <Box>
            <Typography variant="h2" gutterBottom>{deck?.name}</Typography>
            <Grid container spacing={2}>
                {cards.map(card => (
                    <Grid item key={card.scryfallDetails.id} xs={6} sm={4} md={3} lg={2}>
                        <Card sx={{maxWidth: 300, backgroundColor: isCommander(card.scryfallDetails, deck) ? "#AAA" : "white"}}>
                            <CardMedia
                                component="img"
                                image={card.scryfallDetails.image_uris?.normal}
                                alt={card.scryfallDetails.name}
                            />
                            <CardContent>
                                <Typography variant="h5">{card.scryfallDetails.name} ({card.count})</Typography>
                                <Typography variant="body2">{card.scryfallDetails.type_line}</Typography>
                                {isCommander(card.scryfallDetails, deck) && <Typography variant="body2">COMMANDER</Typography>}
                            </CardContent>
                            <CardActions>
                                {canBeCommander(card.scryfallDetails) &&
                                !isCommander(card.scryfallDetails, deck) &&
                                    <Button
                                        size="small"
                                        onClick={() => makeCommander(deck, card.scryfallDetails)}
                                    >
                                        Make Commander
                                    </Button>}
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}