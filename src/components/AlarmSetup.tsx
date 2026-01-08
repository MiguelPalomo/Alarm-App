import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Alert,
    StatusBar,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Alarm } from '../types';
import { StorageService } from '../services/StorageService';
import { AlarmService } from '../services/AlarmService';
import { theme } from '../constants/theme';

interface AlarmSetupProps {
    onAlarmScheduled?: () => void;
}

// Built-in alarm sounds included with the app
const BUILT_IN_SOUNDS = [
    { id: 'jmsn', name: 'JMSN - Love Me', file: require('../../assets/sounds/jmsn_love_me.mp3') },
    { id: 'backseat', name: 'Backseat', file: require('../../assets/sounds/backseat.mp3') },
    { id: 'beabadoobee', name: 'Beabadoobee - The Perfect Pair', file: require('../../assets/sounds/beabadoobee_perfect_pair.mp3') },
];

/**
 * Main screen for setting up and managing alarms
 */
export const AlarmSetup: React.FC<AlarmSetupProps> = ({ onAlarmScheduled }) => {
    const [alarms, setAlarms] = useState<Alarm[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [alarmName, setAlarmName] = useState('My Alarm');
    const [soundSource, setSoundSource] = useState<'builtin' | 'custom'>('builtin');
    const [selectedBuiltInSound, setSelectedBuiltInSound] = useState(BUILT_IN_SOUNDS[0]);
    const [selectedCustomSound, setSelectedCustomSound] = useState<{ uri: string; name: string } | null>(null);
    const [alarmToDelete, setAlarmToDelete] = useState<Alarm | null>(null);

    useEffect(() => {
        loadAlarms();
        requestPermissions();
    }, []);

    const confirmDelete = async () => {
        if (!alarmToDelete) return;

        try {
            await AlarmService.cancelAlarm(alarmToDelete.id);
            await StorageService.deleteAlarm(alarmToDelete.id);
            await loadAlarms();
            setAlarmToDelete(null); // Close modal
        } catch (error) {
            console.error('Error deleting alarm:', error);
        }
    };

    const requestPermissions = async () => {
        const granted = await AlarmService.requestPermissions();
        if (!granted) {
            Alert.alert(
                'Permissions Required',
                'This app needs permissions to schedule alarms.',
                [{ text: 'OK' }]
            );
        }
    };

    const loadAlarms = async () => {
        const savedAlarms = await StorageService.loadAlarms();
        setAlarms(savedAlarms);
    };

    const formatTime = (date: Date): string => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handlePickCustomSound = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'audio/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                setSelectedCustomSound({
                    uri: file.uri,
                    name: file.name,
                });
                setSoundSource('custom');
            }
        } catch (error) {
            console.error('Error picking sound file:', error);
            // Alert.alert('Error', 'Could not select audio file');
        }
    };

    const handleCreateAlarm = async () => {
        try {
            let soundFile: string | any;
            let soundName: string;

            if (soundSource === 'builtin') {
                soundFile = selectedBuiltInSound.id;
                soundName = selectedBuiltInSound.name;
            } else {
                if (!selectedCustomSound) {
                    Alert.alert(
                        'Select Sound',
                        'Please select a custom audio file',
                        [{ text: 'OK' }]
                    );
                    return;
                }
                soundFile = selectedCustomSound.uri;
                soundName = selectedCustomSound.name;
            }

            const newAlarm: Alarm = {
                id: Date.now().toString(),
                name: alarmName,
                time: formatTime(selectedDate),
                enabled: true,
                soundFile: soundFile,
                soundName: soundName,
            };

            await StorageService.saveAlarm(newAlarm);
            await AlarmService.scheduleAlarm(newAlarm);
            await loadAlarms();

            // Reset
            setAlarmName('My Alarm');
            // Keep selected date
            setSoundSource('builtin');
            setSelectedBuiltInSound(BUILT_IN_SOUNDS[0]);
            setSelectedCustomSound(null);

            onAlarmScheduled?.();
        } catch (error) {
            console.error('Error creating alarm:', error);
            Alert.alert('Error', 'Could not create alarm');
        }
    };



    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>ALARM</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Time Selection */}
                <View style={styles.timeSection}>
                    <Pressable onPress={() => setShowTimePicker(true)}>
                        <Text style={styles.mainTimeDisplay}>{formatTime(selectedDate)}</Text>
                    </Pressable>

                    <DatePicker
                        modal
                        open={showTimePicker}
                        date={selectedDate}
                        onConfirm={(date) => {
                            setShowTimePicker(false);
                            setSelectedDate(date);
                        }}
                        onCancel={() => {
                            setShowTimePicker(false);
                        }}
                        mode="time"
                        locale="en_GB" // Force 24h
                        is24hourSource="locale"
                        theme="dark"
                    />
                </View>

                {/* Sound Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>SOUND</Text>

                    <View style={styles.soundList}>
                        {BUILT_IN_SOUNDS.map((sound) => (
                            <Pressable
                                key={sound.id}
                                style={[
                                    styles.soundItem,
                                    selectedBuiltInSound.id === sound.id && soundSource === 'builtin' && styles.soundItemSelected
                                ]}
                                onPress={() => {
                                    setSoundSource('builtin');
                                    setSelectedBuiltInSound(sound);
                                }}
                            >
                                <Text style={[
                                    styles.soundItemText,
                                    selectedBuiltInSound.id === sound.id && soundSource === 'builtin' && styles.soundItemTextSelected
                                ]}>
                                    {sound.name}
                                </Text>
                            </Pressable>
                        ))}

                        <Pressable
                            style={[
                                styles.soundItem,
                                soundSource === 'custom' && styles.soundItemSelected
                            ]}
                            onPress={handlePickCustomSound}
                        >
                            <Text style={[
                                styles.soundItemText,
                                soundSource === 'custom' && styles.soundItemTextSelected
                            ]}>
                                {selectedCustomSound ? selectedCustomSound.name : '+ Custom File'}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Actions */}
                <Pressable
                    style={styles.createButton}
                    onPress={handleCreateAlarm}
                >
                    <Text style={styles.createButtonText}>SET ALARM</Text>
                </Pressable>

                {/* Active Alarms */}
                {alarms.length > 0 && (
                    <View style={styles.activeAlarmsSection}>
                        <Text style={styles.sectionLabel}>ACTIVE</Text>
                        {alarms.map((alarm) => (
                            <View key={alarm.id} style={styles.alarmRow}>
                                <Text style={styles.alarmRowTime}>{alarm.time}</Text>
                                <Pressable
                                    hitSlop={20}
                                    onPress={() => setAlarmToDelete(alarm)}
                                >
                                    <Text style={styles.deleteText}>REMOVE</Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}

            </ScrollView>

            {/* Custom Delete Confirmation Modal */}
            {alarmToDelete && (
                <View style={[StyleSheet.absoluteFill, styles.modalOverlay]}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>DELETE ALARM</Text>
                        <Text style={styles.modalMessage}>Remove alarm for {alarmToDelete.time}?</Text>

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setAlarmToDelete(null)}
                            >
                                <Text style={styles.cancelButtonText}>CANCEL</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.modalButton, styles.deleteButton]}
                                onPress={confirmDelete}
                            >
                                <Text style={styles.deleteButtonText}>DELETE</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingTop: theme.spacing.xxl,
        paddingBottom: theme.spacing.xl,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 2,
        color: theme.colors.textSecondary,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.xl,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    timeSection: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    mainTimeDisplay: {
        ...theme.typography.h1,
        fontSize: 80,
    },
    pickerContainer: {
        marginTop: theme.spacing.m,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        letterSpacing: 1,
        marginBottom: theme.spacing.m,
        textTransform: 'uppercase',
    },
    soundList: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.surfaceHighlight,
    },
    soundItem: {
        paddingVertical: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surfaceHighlight,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    soundItemSelected: {
        borderBottomColor: theme.colors.accent,
    },
    soundItemText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontWeight: '300',
    },
    soundItemTextSelected: {
        color: theme.colors.text,
        fontWeight: '500',
    },
    createButton: {
        backgroundColor: theme.colors.surface,
        marginTop: theme.spacing.l,
        paddingVertical: theme.spacing.l,
        borderRadius: theme.layout.borderRadius,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.surfaceHighlight,
    },
    createButtonText: {
        color: theme.colors.accent,
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 2,
    },
    activeAlarmsSection: {
        marginTop: theme.spacing.xxl,
        marginBottom: theme.spacing.xxl,
    },
    alarmRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surfaceHighlight,
    },
    alarmRowTime: {
        fontSize: 24,
        fontWeight: '300',
        color: theme.colors.text,
    },
    deleteText: {
        fontSize: 12,
        color: theme.colors.error,
        fontWeight: '600',
        letterSpacing: 1,
    },
    // Modal Styles
    modalOverlay: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.xl,
        borderRadius: theme.layout.borderRadius,
        borderWidth: 1,
        borderColor: theme.colors.surfaceHighlight,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 2,
        color: theme.colors.text,
        marginBottom: theme.spacing.l,
    },
    modalMessage: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        gap: theme.spacing.m,
    },
    modalButton: {
        flex: 1,
        paddingVertical: theme.spacing.m,
        borderRadius: 4,
        alignItems: 'center',
        borderWidth: 1,
    },
    cancelButton: {
        borderColor: theme.colors.surfaceHighlight,
    },
    deleteButton: {
        borderColor: theme.colors.error,
        backgroundColor: 'rgba(255, 69, 58, 0.1)',
    },
    cancelButtonText: {
        color: theme.colors.textSecondary,
        fontWeight: '600',
        fontSize: 12,
        letterSpacing: 1,
    },
    deleteButtonText: {
        color: theme.colors.error,
        fontWeight: '600',
        fontSize: 12,
        letterSpacing: 1,
    }
});
