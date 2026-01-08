import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, AppState } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import { AlarmService } from './src/services/AlarmService';
import { SoundService } from './src/services/SoundService';
import { StorageService } from './src/services/StorageService';
import { AlarmSetup } from './src/components/AlarmSetup';
import { AlarmScreen } from './src/components/AlarmScreen';

// Define alarm state interface
interface ActiveAlarm {
    id: string;
    name: string;
    time: string;
}

export default function App() {
    const [isAlarmActive, setIsAlarmActive] = useState(false);
    const [activeAlarm, setActiveAlarm] = useState<ActiveAlarm | null>(null);

    useEffect(() => {
        // Initialize services
        const initializeApp = async () => {
            try {
                await AlarmService.initialize();
                await SoundService.initialize();
                await AlarmService.requestPermissions();
            } catch (error) {
                console.error('Error initializing app:', error);
            }
        };

        initializeApp();

        // Setup foreground event handler
        const unsubscribe = AlarmService.onNotificationEvent(async (event) => {
            console.log('Notification event:', event.type);

            switch (event.type) {
                case EventType.DELIVERED:
                    // Alarm notification delivered, show alarm screen
                    if (event.detail.notification) {
                        const { title, body, id } = event.detail.notification;

                        // Extract time from body (format: "Alarma: HH:mm")
                        const timeMatch = body?.match(/\d{2}:\d{2}/);
                        const time = timeMatch ? timeMatch[0] : '--:--';

                        // Load alarm details to get sound file (ID or URI)
                        const alarms = await StorageService.loadAlarms();
                        const alarm = alarms.find(a => a.id === id);

                        setActiveAlarm({
                            id: id || 'unknown',
                            name: title || 'Alarma',
                            time: time,
                        });
                        setIsAlarmActive(true);

                        // Play alarm sound
                        try {
                            if (alarm?.soundFile) {
                                // Check if it's a built-in sound ID or custom URI
                                let soundSource;

                                if (alarm.soundFile === 'jmsn') {
                                    soundSource = require('./assets/sounds/jmsn_love_me.mp3');
                                } else if (alarm.soundFile === 'backseat') {
                                    soundSource = require('./assets/sounds/backseat.mp3');
                                } else if (alarm.soundFile === 'beabadoobee') {
                                    soundSource = require('./assets/sounds/beabadoobee_perfect_pair.mp3');
                                    // It's a custom file URI
                                    soundSource = alarm.soundFile;
                                }

                                await SoundService.playAlarmSound(soundSource);
                            } else {
                                console.warn('No sound file found for alarm');
                            }
                        } catch (error) {
                            console.error('Error playing alarm sound:', error);
                        }
                    }
                    break;

                case EventType.PRESS:
                    // User pressed the notification
                    console.log('Notification pressed');
                    break;

                case EventType.DISMISSED:
                    // Notification dismissed (shouldn't happen with ongoing alarm)
                    console.log('Notification dismissed');
                    break;
            }
        });

        // Cleanup
        return () => {
            unsubscribe();
            SoundService.stopSound();
        };
    }, []);

    // Check for active alarms when app comes to foreground or launches
    useEffect(() => {
        const checkActiveAlarms = async () => {
            const notifications = await notifee.getDisplayedNotifications();
            const alarmNotification = notifications.find(n => n.notification.android?.channelId === 'alarm-channel-v3');

            if (alarmNotification) {
                const { title, body, id } = alarmNotification.notification;
                // Extract time from body (format: "Alarma: HH:mm")
                const timeMatch = body?.match(/\d{2}:\d{2}/);
                const time = timeMatch ? timeMatch[0] : '--:--';

                // Load alarm details
                const alarms = await StorageService.loadAlarms();
                const alarm = alarms.find(a => a.id === id);

                setActiveAlarm({
                    id: id || 'unknown',
                    name: title || 'Alarm',
                    time: time,
                });
                setIsAlarmActive(true);

                // Play sound if not already playing (SoundService handles idempotency usually, but let's be safe)
                // Actually, SoundService.playAlarmSound might restart it. 
                // However, we need to ensure we play the correct sound.
                if (alarm?.soundFile) {
                    let soundSource;
                    if (alarm.soundFile === 'jmsn') {
                        soundSource = require('./assets/sounds/jmsn_love_me.mp3');
                    } else if (alarm.soundFile === 'backseat') {
                        soundSource = require('./assets/sounds/backseat.mp3');
                    } else if (alarm.soundFile === 'beabadoobee') {
                        soundSource = require('./assets/sounds/beabadoobee_perfect_pair.mp3');
                    } else {
                        soundSource = alarm.soundFile;
                    }
                    await SoundService.playAlarmSound(soundSource);
                }
            }
        };

        // Check for active alarms safely
        const safeCheckActiveAlarms = async () => {
            try {
                await checkActiveAlarms();
            } catch (error) {
                console.error('Error verifying active alarms:', error);
            }
        };

        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                safeCheckActiveAlarms();
            }
        });

        // Run initial check
        safeCheckActiveAlarms();

        return () => {
            subscription.remove();
        };
    }, []);



    const handleDismissAlarm = async () => {
        // Stop sound
        await SoundService.stopSound();

        // Cancel notification to prevent re-triggering
        if (activeAlarm?.id) {
            await AlarmService.cancelAlarm(activeAlarm.id);
        }

        // Hide alarm screen
        setIsAlarmActive(false);
        setActiveAlarm(null);
    };

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#000000"
                translucent={false}
            />

            {isAlarmActive && activeAlarm ? (
                <AlarmScreen
                    alarmName={activeAlarm.name}
                    alarmTime={activeAlarm.time}
                    onDismiss={handleDismissAlarm}
                />
            ) : (
                <AlarmSetup />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
});
