import * as React from 'react';

import Dialog from '@mui/material/Dialog';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';

import type {CardState} from "../../firebase-interop/models/playerState";
import {CardReference} from "../../firebase-interop/models/deck";

interface ImageUris {
    small?: string;
    normal?: string;
    large?: string;
    png?: string;
    art_crop?: string;
    border_crop?: string;
}

type CoreDetails = {
    name: string,
    mana_cost?: string | null;
    image_uris?: ImageUris | null;
    loyalty?: string | null;
    defense?: string | null;
    type_line?: string | null;
    oracle_text?: string | null;
    flavor_text?: string | null;
    power?: string | null;
    toughness?: string | null,
};

const symbolMap: {[key: string]: {image: string, alt: string}} = {
    "T": {
        image: "/images/symbols/tap-symbol.webp",
        alt: "Tap",
    },
    "U": {
        image: "/images/symbols/blue-mana-symbol.svg",
        alt: "Blue",
    },
    "B": {
        image: "/images/symbols/black-mana-symbol.svg",
        alt: "Black",
    },
    "G": {
        image: "/images/symbols/green-mana-symbol.svg",
        alt: "Green",
    },
    "R": {
        image: "/images/symbols/red-mana-symbol.svg",
        alt: "Red",
    },
    "W": {
        image: "/images/symbols/white-mana-symbol.svg",
        alt: "White",
    },
    "C": {
        image: "/images/symbols/colorless-mana-symbol.svg",
        alt: "Colorless",
    },
    "U/B": {
        image: "/images/symbols/blue-black-mana-symbol.svg",
        alt: "Blue/Black",
    },
    "B/R": {
        image: "/images/symbols/black-red-mana-symbol.svg",
        alt: "Black/Red",
    },
    "R/G": {
        image: "/images/symbols/red-green-mana-symbol.svg",
        alt: "Red/Green",
    },
    "G/W": {
        image: "/images/symbols/green-white-mana-symbol.svg",
        alt: "Green/White",
    },
    "W/U": {
        image: "/images/symbols/white-blue-mana-symbol.svg",
        alt: "White/Blue",
    },
    "B/G": {
        image: "/images/symbols/black-green-mana-symbol.svg",
        alt: "Black/Green",
    },
    "R/W": {
        image: "/images/symbols/red-white-mana-symbol.svg",
        alt: "Red/White",
    },
    "W/B": {
        image: "/images/symbols/white-black-mana-symbol.svg",
        alt: "White/Black",
    },
    "U/R": {
        image: "/images/symbols/blue-red-mana-symbol.svg",
        alt: "Blue/Red",
    },
    "G/U": {
        image: "/images/symbols/green-blue-mana-symbol.svg",
        alt: "Green/Blue",
    },
    "B/P": {
        image: "/images/symbols/black-phyrexian-mana-symbol.svg",
        alt: "Black/Phyrexian",
    },
    "G/P": {
        image: "/images/symbols/green-phyrexian-mana-symbol.svg",
        alt: "Green/Phyrexian",
    },
    "R/P": {
        image: "/images/symbols/red-phyrexian-mana-symbol.svg",
        alt: "Red/Phyrexian",
    },
    "W/P": {
        image: "/images/symbols/white-phyrexian-mana-symbol.svg",
        alt: "White/Phyrexian",
    },
    "U/P": {
        image: "/images/symbols/blue-phyrexian-mana-symbol.svg",
        alt: "Blue/Phyrexian",
    },
    "C/P": {
        image: "/images/symbols/colorless-phyrexian-mana-symbol.svg",
        alt: "Colorless/Phyrexian",
    },
};

function formatParagraph(paragraph: string): Array<JSX.Element | string> {
    // Find text like {X} and replace it with a chip
    const parts = paragraph.split(/(\{.*?\})/);
    return parts.map((part, index) => {
        if (part.startsWith("{") && part.endsWith("}")) {
            part = part.split("{")[1].split("}")[0];

            let symbol = symbolMap[part];
            if (symbol) {
                return <img
                    src={symbol.image}
                    alt={symbol.alt}
                    width={32}
                    style={{verticalAlign: "middle"}}
                />;
            }

            return <Chip key={index} label={part} sx={{fontSize: "1.2em"}} />;
        }
        return part;
    });
}

function formatText(text: string, withParagraphs: boolean = false): Array<JSX.Element> {
    const paragraphs = text.split("\n");
    const formattedParagraphs = paragraphs.map(formatParagraph);

    if (!withParagraphs) {
        return formattedParagraphs.map((paragraph, index) => (
        <div key={index}>{paragraph}</div>))
    }

    return formattedParagraphs.map((paragraph, index) => (
        <p key={index} style={{fontSize: "1.2em"}}>{paragraph}</p>));
}

export function CardDetails({card, cardState, onClose}: {
    card: CardReference | undefined,
    cardState: CardState,
    onClose: () => void,
}) {
    const [faceIndex, setFaceIndex] = React.useState(0);

    if (!card) {
        return <Card variant="outlined">
            <Grid container spacing={2}>
                <Grid item>
                    <h1>Unknown Card</h1>
                </Grid>
            </Grid>
        </Card>;
    }
    let details: CoreDetails = card.scryfallDetails;
    console.log("details", details)

    const hasMultipleFaces = card.scryfallDetails.card_faces.length > 1;
    if (hasMultipleFaces) {
        details = card.scryfallDetails.card_faces[faceIndex];

        if (!details.image_uris || !details.image_uris.art_crop) {
            details.image_uris = {
                ...card.scryfallDetails.image_uris,
                ...details.image_uris ?? {},
            };
        }
    }

    return <Dialog open={true} onClose={onClose} onClick={onClose}>
        <Card variant="outlined" sx={{width: 480, padding: 1, margin: 1}}>
            <Grid container spacing={2}>
                <Grid item xs={8}>
                    <span style={{
                        fontSize: "1.5em",
                    }}>{details.name}</span>
                </Grid>
                <Grid item xs={4} container justifyContent={"end"}>
                    {formatText(details.mana_cost ?? "")}
                </Grid>
                <Grid item xs={12} container justifyContent={"center"}>
                    <img
                        src={details.image_uris?.art_crop}
                        alt={details.name}
                        style={{maxHeight: 320, maxWidth: 480}}
                    />
                </Grid>
                <Grid item xs={12}>
                    <span style={{fontSize: "1.2em"}}>{details.type_line}</span>
                </Grid>
                <Grid item xs={12}>
                    {formatText(details.oracle_text ?? "", true)}
                </Grid>
                {details.flavor_text && <Grid item xs={12}>
                    <span style={{fontStyle: "italic"}}>
                        {details.flavor_text}
                    </span>
                </Grid>}
                <Grid item xs={12} container justifyContent={"end"}>
                    {
                        (details.power !== undefined || details.toughness !== undefined) &&
                        <Chip sx={{fontSize: "1.2em"}} label={`${details.power} / ${details.toughness}`} />
                    }
                    {details.loyalty && <Chip sx={{fontSize: "1.2em"}} label={details.loyalty} />}
                    {details.defense && <Chip sx={{fontSize: "1.2em"}} label={details.defense} />}
                </Grid>
                {hasMultipleFaces && <Grid item xs={12} container justifyContent={"end"}>
                    {card.scryfallDetails.card_faces.map((face, index) => <Button
                        key={index}
                        variant={index === faceIndex ? "contained" : "outlined"}
                        onClick={(event) => {
                            setFaceIndex(index);
                            event.stopPropagation();
                        }}
                    >{index + 1}</Button>)}
                </Grid>}
            </Grid>
        </Card>
    </Dialog>;
}