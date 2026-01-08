import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '../types';

const STORAGE_KEY = '@alarm_app_alarms';

/**
 * Service for persisting alarm data using AsyncStorage
 */
export class StorageService {
    /**
     * Save alarms to storage
     */
    static async saveAlarms(alarms: Alarm[]): Promise<void> {
        try {
            const jsonValue = JSON.stringify(alarms);
            await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
        } catch (e) {
            console.error('Error saving alarms:', e);
            throw e;
        }
    }

    /**
     * Load alarms from storage
     */
    static async loadAlarms(): Promise<Alarm[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error('Error loading alarms:', e);
            return [];
        }
    }

    /**
     * Clear all alarms from storage
     */
    static async clearAlarms(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error('Error clearing alarms:', e);
            throw e;
        }
    }

    /**
     * Save a single alarm (updates or adds)
     */
    static async saveAlarm(alarm: Alarm): Promise<void> {
        try {
            const alarms = await this.loadAlarms();
            const index = alarms.findIndex(a => a.id === alarm.id);

            if (index >= 0) {
                alarms[index] = alarm;
            } else {
                alarms.push(alarm);
            }

            await this.saveAlarms(alarms);
        } catch (e) {
            console.error('Error saving alarm:', e);
            throw e;
        }
    }

    /**
     * Delete a single alarm
     */
    static async deleteAlarm(alarmId: string): Promise<void> {
        try {
            const alarms = await this.loadAlarms();
            const filtered = alarms.filter(a => a.id !== alarmId);
            await this.saveAlarms(filtered);
        } catch (e) {
            console.error('Error deleting alarm:', e);
            throw e;
        }
    }
}
