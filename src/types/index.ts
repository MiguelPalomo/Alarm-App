/**
 * Type definitions for the Alarm App
 */

export interface Alarm {
    id: string;
    name: string;
    time: string; // HH:mm format
    enabled: boolean;
    soundFile?: string; // URI of the audio file
    soundName?: string; // Display name of the audio file
}

export interface AlarmSound {
    id: string;
    name: string;
    fileName: string;
    filePath: string;
}
