class SoundManager {
    private sounds: { [key: string]: HTMLAudioElement } = {};
    private volume: number = 0.3;

    constructor() {
        this.initializeSounds();
    }

    private initializeSounds() {
        this.sounds = {
            // correct: new Audio("/sounds/correct.mp3"),
            // wrong: new Audio("/sounds/wrong.mp3"),
            // hover: new Audio("/sounds/hover.mp3"),
            // click: new Audio("/sounds/click.mp3"),
            // timeout: new Audio("/sounds/timeout.mp3"),
            // skip: new Audio("/sounds/skip.mp3"),
        };

        Object.values(this.sounds).forEach((sound) => {
            sound.volume = this.volume;
        });
    }

    setVolume(volume: number) {
        this.volume = volume;
        Object.values(this.sounds).forEach((sound) => {
            sound.volume = volume;
        });
    }

    play(soundName: keyof typeof this.sounds) {
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch((e) => console.error("Error playing sound:", e));
        }
    }
}

export const soundManager = new SoundManager();
