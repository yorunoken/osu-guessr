type SoundName = "correct" | "wrong" | "hover" | "click" | "timeout" | "skip";

class SoundManager {
    private sounds: Map<SoundName, HTMLAudioElement> = new Map();
    private volume: number = 0.3;
    private isEnabled: boolean = true;
    private preloadPromises: Map<SoundName, Promise<void>> = new Map();

    constructor() {
        this.initializeSounds();
    }

    private initializeSounds() {
        // Sound files configuration - uncomment when sound files are available
        /*
        const soundFiles: Record<SoundName, string> = {
            correct: "/sounds/correct.mp3",
            wrong: "/sounds/wrong.mp3",
            hover: "/sounds/hover.mp3",
            click: "/sounds/click.mp3",
            timeout: "/sounds/timeout.mp3",
            skip: "/sounds/skip.mp3",
        };

        Object.entries(soundFiles).forEach(([name, src]) => {
            const audio = new Audio(src);
            audio.volume = this.volume;
            audio.preload = 'auto';
            
            const preloadPromise = new Promise<void>((resolve, reject) => {
                audio.addEventListener('canplaythrough', () => resolve(), { once: true });
                audio.addEventListener('error', reject, { once: true });
            });
            
            this.sounds.set(name as SoundName, audio);
            this.preloadPromises.set(name as SoundName, preloadPromise);
        });
        */
    }

    async preloadSounds(): Promise<void> {
        try {
            await Promise.all(this.preloadPromises.values());
            console.log("All sounds preloaded successfully");
        } catch (error) {
            console.warn("Some sounds failed to preload:", error);
        }
    }

    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
        this.sounds.forEach((sound) => {
            sound.volume = this.volume;
        });
    }

    getVolume(): number {
        return this.volume;
    }

    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
    }

    isAudioEnabled(): boolean {
        return this.isEnabled;
    }

    async play(soundName: SoundName): Promise<void> {
        if (!this.isEnabled) return;

        const sound = this.sounds.get(soundName);
        if (!sound) {
            console.warn(`Sound '${soundName}' not found`);
            return;
        }

        try {
            // Reset to beginning
            sound.currentTime = 0;
            await sound.play();
        } catch (error) {
            console.warn(`Failed to play sound '${soundName}':`, error);
        }
    }

    stop(soundName?: SoundName): void {
        if (soundName) {
            const sound = this.sounds.get(soundName);
            if (sound) {
                sound.pause();
                sound.currentTime = 0;
            }
        } else {
            // Stop all sounds
            this.sounds.forEach((sound) => {
                sound.pause();
                sound.currentTime = 0;
            });
        }
    }

    dispose(): void {
        this.sounds.forEach((sound) => {
            sound.pause();
            sound.currentTime = 0;
            sound.src = "";
        });
        this.sounds.clear();
        this.preloadPromises.clear();
    }
}

export const soundManager = new SoundManager();
