import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    Vibration,
} from 'react-native';

interface EmergencyButtonProps {
    onComplete: () => void;
    requiredDuration?: number; // in milliseconds
}

/**
 * Emergency button that requires 5 seconds of continuous press to activate
 */
export const EmergencyButton: React.FC<EmergencyButtonProps> = ({
    onComplete,
    requiredDuration = 5000,
}) => {
    const [isPressing, setIsPressing] = useState(false);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const pressTimer = useRef<NodeJS.Timeout | null>(null);

    const startPress = () => {
        setIsPressing(true);

        // Animate progress
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: requiredDuration,
            useNativeDriver: false,
        }).start();

        // Set timer for completion
        pressTimer.current = setTimeout(() => {
            // Vibrate on completion
            Vibration.vibrate([0, 200, 100, 200]);
            onComplete();
            resetPress();
        }, requiredDuration);
    };

    const resetPress = () => {
        setIsPressing(false);

        // Cancel timer
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }

        // Reset animation
        progressAnim.stopAnimation();
        progressAnim.setValue(0);
    };

    const progressPercentage = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            <Pressable
                onPressIn={startPress}
                onPressOut={resetPress}
                style={[
                    styles.button,
                    isPressing && styles.buttonPressed,
                ]}
            >
                <View style={styles.progressContainer}>
                    <Animated.View
                        style={[
                            styles.progressBar,
                            { width: progressPercentage },
                        ]}
                    />
                </View>

                <View style={styles.content}>
                    <Text style={styles.icon}>🚨</Text>
                    <Text style={styles.text}>
                        {isPressing ? 'Mantén presionado...' : 'EMERGENCIA'}
                    </Text>
                    <Text style={styles.subtext}>
                        {isPressing ? 'Mantén 5 segundos' : 'Mantén para detener'}
                    </Text>
                </View>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#dc2626',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonPressed: {
        backgroundColor: '#991b1b',
        transform: [{ scale: 0.95 }],
    },
    progressContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#16a34a',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    icon: {
        fontSize: 48,
        marginBottom: 8,
    },
    text: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtext: {
        color: '#fca5a5',
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
});
