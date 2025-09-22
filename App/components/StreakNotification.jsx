import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const StreakNotification = ({ title, message, streakCount }) => {
    const totalCircles = 7;
    const filledCircles = streakCount % (totalCircles + 1);

    return (
        <View style={styles.shadowContainer}>
            <LinearGradient
                colors={['#1A1A1A', '#0A0A0A']}
                style={styles.container}
            >
                <View style={styles.leftContent}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.circlesContainer}>
                        {[...Array(totalCircles)].map((_, i) => (
                            <View key={i} style={[styles.circle, i < filledCircles && styles.filledCircle]}>
                                {i < filledCircles && <Ionicons name="checkmark" size={12} color="#1A1A1A" />}
                            </View>
                        ))}
                    </View>
                </View>
                <View style={styles.rightContent}>
                    <Image
                        source={require('../assets/StreakImage3.png')}
                        style={styles.streakImage}
                    />
                    <Text style={styles.streakNumber}>{streakCount}</Text>
                    <Text style={styles.streakLabel}>DAY STREAK</Text>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 15,
    },
    container: {
        width: '100%',
        borderRadius: 22,
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    leftContent: {
        flex: 1,
    },
    rightContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    message: {
        color: '#A0A0A0',
        fontSize: 14,
        marginTop: 4,
    },
    circlesContainer: {
        flexDirection: 'row',
        marginTop: 12,
    },
    circle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderStyle: 'dashed',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filledCircle: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
        borderStyle: 'solid',
    },
    streakImage: {
        position: 'absolute',
        width: 80,
        height: 80,
        opacity: 0.7,
    },
    streakNumber: {
        color: '#FFFFFF',
        fontSize: 40,
        fontWeight: 'bold',
    },
    streakLabel: {
        color: '#A0A0A0',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
});

export default StreakNotification;
