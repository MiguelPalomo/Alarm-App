import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';

/**
 * Service for playing alarm sounds
 */
export class SoundService {
    private static sound: Audio.Sound | null = null;
    private static isPlaying: boolean = false;

    /**
     * Initialize audio mode and preload sounds
     */
    static async initialize(): Promise<void> {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: false,
                playThroughEarpieceAndroid: false,
            });

            // Preload built-in sounds
            const sounds = [
                require('../../assets/sounds/jmsn_love_me.mp3'),
                require('../../assets/sounds/backseat.mp3'),
                require('../../assets/sounds/beabadoobee_perfect_pair.mp3'),
            ];

            await Promise.all(
                sounds.map(sound => Asset.fromModule(sound).downloadAsync())
            );
            console.log('Sounds preloaded successfully');

        } catch (error) {
            console.error('Error initializing audio:', error);
        }
    }

    /**
   * Play alarm sound from URI or require statement
   * The audio will play in full and then loop
   * @param soundSource - URI string or require('./path/to/file.mp3')
   */
    static async playAlarmSound(soundSource: string | any): Promise<void> {
        try {
            // Stop any currently playing sound
            await this.stopSound();

            // Determine if source is URI string or require
            const source = typeof soundSource === 'string'
                ? { uri: soundSource }
                : soundSource;

            // Create and load new sound
            const { sound } = await Audio.Sound.createAsync(
                source,
                {
                    shouldPlay: true,
                    isLooping: true, // Loop the entire audio file
                    volume: 1.0,
                }
            );

            this.sound = sound;
            this.isPlaying = true;

            // Set up completion listener to ensure smooth looping
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish && !status.isLooping) {
                    // Manually restart if looping fails
                    sound.replayAsync();
                }
            });

            // Play the sound
            await sound.playAsync();
        } catch (error) {
            console.error('Error playing alarm sound:', error);
            throw error;
        }
    }

    /**
     * Stop currently playing sound
     */
    static async stopSound(): Promise<void> {
        try {
            if (this.sound) {
                await this.sound.stopAsync();
                await this.sound.unloadAsync();
                this.sound = null;
                this.isPlaying = false;
            }
        } catch (error) {
            console.error('Error stopping sound:', error);
        }
    }

    /**
     * Check if sound is currently playing
     */
    static getIsPlaying(): boolean {
        return this.isPlaying;
    }

    /**
     * Set volume (0.0 to 1.0)
     */
    static async setVolume(volume: number): Promise<void> {
        try {
            if (this.sound) {
                await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
            }
        } catch (error) {
            console.error('Error setting volume:', error);
        }
    }
}
