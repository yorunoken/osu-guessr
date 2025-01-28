export interface GuessResult {
    correct: boolean;
    actualSong: {
        title: string;
        artist: string;
        mapper: string;
    };
    points: number;
}
