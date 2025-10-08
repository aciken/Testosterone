import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { allBadges } from '../data/badgeData';

const screenWidth = Dimensions.get('window').width;

const BadgeItem = ({ name, image, unlocked, description }) => {
    return (
        <View style={[styles.badgeItem, !unlocked && styles.badgeItemLocked]}>
            <View style={[styles.badgeImageContainer, unlocked && styles.badgeImageContainerUnlocked]}>
                {unlocked ? (
                    <Image source={image} style={styles.badgeImage} />
                ) : (
                    <Ionicons name="lock-closed" size={40} color="rgba(255, 255, 255, 0.3)" />
                )}
            </View>
            <Text style={styles.badgeName}>{name}</Text>
            <Text style={styles.badgeDescription}>{description}</Text>
        </View>
    );
};

export default function AllBadgesScreen() {
    const router = useRouter();

    return (
        <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>All Badges</Text>
                    <View style={{ width: 24 }} />
                </View>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    {allBadges.map(badge => (
                        <TouchableOpacity key={badge.id} onPress={() => badge.unlocked && router.push({ pathname: '/badgeDetails', params: { ...badge, image: badge.image ? Image.resolveAssetSource(badge.image).uri : null } })}>
                            <BadgeItem {...badge} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {},
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    contentContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        paddingBottom: 50,
    },
    badgeItem: {
        width: (screenWidth - 40) / 2 - 10,
        alignItems: 'center',
        marginBottom: 25,
        padding: 15,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    badgeItemLocked: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    badgeImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    badgeImageContainerUnlocked: {
        borderColor: '#C0C0C0',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 10,
    },
    badgeImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
    },
    badgeName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
        height: 40,
    },
    badgeDescription: {
        color: '#A0A0A0',
        fontSize: 12,
        textAlign: 'center',
        height: 30,
    },
});
