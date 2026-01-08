import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { EmergencyButton } from './EmergencyButton';
import { SoundService } from '../services/SoundService';
import { theme } from '../constants/theme';

const { height } = Dimensions.get('window');

interface AlarmScreenProps {
    alarmName: string;
    alarmTime: string;
    onDismiss: () => void;
}

/**
 * Full-screen alarm screen that displays when alarm goes off
 * Shows over lock screen and keeps display awake
 */
export const AlarmScreen: React.FC<AlarmScreenProps> = ({
    alarmName,
    alarmTime,
    onDismiss,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Keep screen awake
        activateKeepAwakeAsync();

        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        // Cleanup
        return () => {
            deactivateKeepAwake();
            fadeAnim.stopAnimation();
        };
    }, []);

    const handleEmergencyComplete = async () => {
        await SoundService.stopSound();
        onDismiss();
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <View style={styles.content}>

                {/* Minimal Header */}
                <Text style={styles.headerTitle}>ACTIVE ALARM</Text>

                {/* Main Time Display */}
                <View style={styles.timeContainer}>
                    <Text style={styles.alarmTime}>{alarmTime}</Text>
                </View>

                {/* Alarm Name Details */}
                <Text style={styles.alarmName}>{alarmName}</Text>

                {/* Emergency Action */}
                <View style={styles.actionContainer}>
                    <EmergencyButton onComplete={handleEmergencyComplete} />
                    <Text style={styles.instructions}>
                        LONG PRESS TO DISMISS
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: height * 0.15,
        width: '100%',
    },
    headerTitle: {
        color: theme.colors.error,
        fontSize: 14,
        letterSpacing: 3,
        fontWeight: '700',
    },
    timeContainer: {
        alignItems: 'center',
    },
    alarmTime: {
        fontSize: 120, // Massive
        fontWeight: '100', // Ultra thin
        color: theme.colors.text,
        letterSpacing: -4,
    },
    alarmName: {
        fontSize: 18,
        color: theme.colors.textSecondary,
        fontWeight: '300',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    actionContainer: {
        alignItems: 'center',
        gap: 24,
    },
    instructions: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
});
