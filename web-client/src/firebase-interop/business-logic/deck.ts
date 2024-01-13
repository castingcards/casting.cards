import ShuffleSeed from "shuffle-seed";

export function shuffle<T>(things: Array<T>): Array<T> {
    const shuffleSeed = Math.floor(Math.random() * 1000000);
    const shuffledThings: Array<T> = ShuffleSeed.shuffle(things, shuffleSeed);
    return shuffledThings;
}