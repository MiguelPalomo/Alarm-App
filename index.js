import { Platform } from 'react-native';
import { AlarmService } from './src/services/AlarmService';
import { SoundService } from './src/services/SoundService';
import { EventType } from '@notifee/react-native';
import { StorageService } from './src/services/StorageService';

// Register background handler globally to survive app kills
// This must be done outside of React components
AlarmService.setupBackgroundHandler(async (event) => {
    console.log('Background Event:', event.type);

    // Handle DELIVERED event (Alarm firing)
    if (event.type === EventType.DELIVERED) {
        if (event.detail.notification) {
            const { id } = event.detail.notification;
            console.log('Alarm delivered in background/dead state, id:', id);

            try {
                // Initialize SoundService (safe to call multiple times)
                await SoundService.initialize();

                // Load alarms to get sound file
                const alarms = await StorageService.loadAlarms();
                const alarm = alarms.find(a => a.id === id);

                if (alarm?.soundFile) {
                    console.log('Background: Found alarm with soundFile:', alarm.soundFile);
                    let soundSource;
                    if (alarm.soundFile === 'jmsn') {
                        soundSource = require('./assets/sounds/jmsn_love_me.mp3');
                    } else if (alarm.soundFile === 'backseat') {
                        soundSource = require('./assets/sounds/backseat.mp3');
                    } else if (alarm.soundFile === 'beabadoobee') {
                        soundSource = require('./assets/sounds/beabadoobee_perfect_pair.mp3');
                    } else {
                        // Custom URI - Ensure it is a string
                        soundSource = typeof alarm.soundFile === 'object' && alarm.soundFile.uri
                            ? alarm.soundFile.uri
                            : alarm.soundFile;
                    }

                    console.log('Background: Playing sound with source:', soundSource);
                    await SoundService.playAlarmSound(soundSource);
                } else {
                    console.warn('No sound file found for alarm in background');
                }
            } catch (error) {
                console.error('Error handling background alarm:', error);
            }
        }
    }

    // Handle dismissal or action press in background
    if (event.type === EventType.DISMISSED ||
        event.type === EventType.PRESS ||
        event.type === EventType.ACTION_PRESS) {

        console.log('Stopping sound from background event');
        await SoundService.stopSound();

        if (event.detail.notification?.id) {
            await AlarmService.cancelAlarm(event.detail.notification.id);
        }
    }
});

import 'expo-router/entry';
