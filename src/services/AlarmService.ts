import notifee, {
    AndroidImportance,
    AndroidCategory,
    TriggerType,
    TimestampTrigger,
    Event,
    EventType
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { Alarm } from '../types';

const CHANNEL_ID = 'alarm-channel-v3';
const CHANNEL_NAME = 'Alarm Notifications (Silent)';

/**
 * Service for managing alarms using Notifee with full-screen notifications
 */
export class AlarmService {
    /**
     * Initialize the alarm service and create notification channel
     */
    static async initialize(): Promise<void> {
        if (Platform.OS === 'android') {
            // Create a high-priority notification channel for alarms
            // v3: No default sound (we handle it via SoundService)
            await notifee.createChannel({
                id: 'alarm-channel-v3',
                name: 'Alarm Notifications (Silent)',
                importance: AndroidImportance.HIGH,
                vibration: true,
                vibrationPattern: [300, 500, 300, 500],
            });
        }
    }

    /**
     * Request necessary permissions for alarms
     */
    static async requestPermissions(): Promise<boolean> {
        try {
            // Request notification permission
            const settings = await notifee.requestPermission();

            if (Platform.OS === 'android') {
                // For Android 12+, check if we can schedule exact alarms
                const canScheduleExactAlarms = await notifee.getNotificationSettings();

                // If we can't schedule exact alarms, open settings
                if (canScheduleExactAlarms.android.alarm !== 1) {
                    console.warn('Exact alarm permission not granted');
                    // You can prompt user to enable it in settings
                    await notifee.openAlarmPermissionSettings();
                    return false;
                }
            }

            return settings.authorizationStatus >= 1; // 1 = authorized
        } catch (error) {
            console.error('Error requesting permissions:', error);
            return false;
        }
    }

    /**
     * Schedule an alarm with full-screen intent
     */
    static async scheduleAlarm(alarm: Alarm): Promise<string> {
        try {
            // Parse alarm time (HH:mm format)
            const [hours, minutes] = alarm.time.split(':').map(Number);

            // Create date for alarm
            const alarmDate = new Date();
            alarmDate.setHours(hours);
            alarmDate.setMinutes(minutes);
            alarmDate.setSeconds(0);
            alarmDate.setMilliseconds(0);

            // If the time is in the past, schedule for tomorrow
            if (alarmDate.getTime() <= Date.now()) {
                alarmDate.setDate(alarmDate.getDate() + 1);
            }

            // Create timestamp trigger
            const trigger: TimestampTrigger = {
                type: TriggerType.TIMESTAMP,
                timestamp: alarmDate.getTime(),
                alarmManager: {
                    allowWhileIdle: true,
                },
            };

            // Create notification with full-screen intent
            const notificationId = await notifee.createTriggerNotification(
                {
                    id: alarm.id,
                    title: alarm.name,
                    body: `Alarma: ${alarm.time}`,
                    android: {
                        channelId: CHANNEL_ID,
                        importance: AndroidImportance.HIGH,
                        category: AndroidCategory.ALARM,
                        vibrationPattern: [300, 500, 300, 500],
                        fullScreenAction: {
                            id: 'alarm_full_screen',
                            launchActivity: 'default',
                        },
                        pressAction: {
                            id: 'alarm_press',
                            launchActivity: 'default',
                        },
                        autoCancel: false,
                        ongoing: true,
                    },
                },
                trigger
            );

            console.log(`Alarm scheduled for ${alarmDate.toLocaleString()}`);
            return notificationId;
        } catch (error) {
            console.error('Error scheduling alarm:', error);
            throw error;
        }
    }

    /**
     * Cancel a scheduled alarm
     */
    static async cancelAlarm(alarmId: string): Promise<void> {
        try {
            await notifee.cancelNotification(alarmId);
            console.log(`Alarm ${alarmId} cancelled`);
        } catch (error) {
            console.error('Error cancelling alarm:', error);
            throw error;
        }
    }

    /**
     * Cancel all scheduled alarms
     */
    static async cancelAllAlarms(): Promise<void> {
        try {
            await notifee.cancelAllNotifications();
            console.log('All alarms cancelled');
        } catch (error) {
            console.error('Error cancelling all alarms:', error);
            throw error;
        }
    }

    /**
     * Get all scheduled alarms
     */
    static async getTriggerNotifications(): Promise<any[]> {
        try {
            const notifications = await notifee.getTriggerNotifications();
            return notifications;
        } catch (error) {
            console.error('Error getting trigger notifications:', error);
            return [];
        }
    }

    /**
     * Handle notification events (foreground, background, killed state)
     */
    static onNotificationEvent(handler: (event: Event) => void): () => void {
        return notifee.onForegroundEvent(handler);
    }

    /**
     * Setup background event handler (must be called at app entry)
     */
    static setupBackgroundHandler(handler: (event: Event) => Promise<void>): void {
        notifee.onBackgroundEvent(handler);
    }
}
