import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler';

const ranks = [
    { name: 'Bronze', minScore: 250, maxScore: 350, image: require('../assets/BronzeRank.png'), color: '#E6A66A' },
    { name: 'Silver', minScore: 351, maxScore: 600, image: require('../assets/SilverRank.png'), color: '#C0C0C0' },
    { name: 'Gold', minScore: 601, maxScore: 750, image: require('../assets/GoldRank.png'), color: '#FFD700' },
    { name: 'Platinum', minScore: 751, maxScore: 900, image: require('../assets/DiamondRank.png'), color: '#E5E4E2' },
    { name: 'Champion', minScore: 901, maxScore: 1100, image: require('../assets/ChampionRank.png'), color: '#B9F2FF' },
];

const RankItem = ({ rank, isCurrent, isAchieved, isLast }) => {
    return (
        <View style={styles.rankItem}>
            {!isLast && <View style={styles.timelineConnector} />}
            <View style={[styles.rankIconContainer, isAchieved && { borderColor: rank.color, shadowColor: rank.color }]}>
                <Image 
                    source={rank.image} 
                    style={styles.rankImage}
                    blurRadius={!isAchieved ? 5 : 0}
                />
                {!isAchieved && <View style={styles.lockedOverlay} />}
                {!isAchieved && <Ionicons name="lock-closed" size={24} color="rgba(255, 255, 255, 0.7)" style={styles.lockIcon} />}
            </View>
            <View style={styles.rankDetails}>
                <Text style={[styles.rankName, isAchieved && styles.rankNameActive]}>{rank.name}</Text>
                <Text style={[styles.rankScore, isAchieved && styles.rankScoreActive]}>{rank.minScore}+ ng/dl</Text>
            </View>
        </View>
    );
};

export default function RankTimelineScreen() {
    const router = useRouter();
    const { currentTScore } = useLocalSearchParams();
    const score = parseInt(currentTScore);

    return (
        <LinearGradient colors={['#1C1C1E', '#000000']} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Rank Timeline</Text>
                    <View style={{ width: 24 }} />
                </View>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    {ranks.map((rank, index) => {
                        const isCurrent = score >= rank.minScore && score <= rank.maxScore;
                        const isAchieved = score >= rank.minScore;
                        return <RankItem key={index} rank={rank} isCurrent={isCurrent} isAchieved={isAchieved} isLast={index === ranks.length - 1} />;
                    })}
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
        borderBottomWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {},
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
    },
    contentContainer: {
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 50,
    },
    rankItem: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 20,
    },
    timelineConnector: {
        position: 'absolute',
        left: 49,
        top: 100,
        width: 2,
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    rankIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#1C1C1E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 10,
    },
    rankImage: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
    },
    lockedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 50,
    },
    lockIcon: {
        position: 'absolute',
    },
    rankDetails: {
        marginLeft: 25,
    },
    rankName: {
        color: '#888888',
        fontSize: 24,
        fontWeight: 'bold',
    },
    rankNameActive: {
        color: '#FFFFFF',
    },
    rankScore: {
        color: '#888888',
        fontSize: 16,
        fontWeight: '500',
        marginTop: 5,
    },
    rankScoreActive: {
        color: '#FFFFFF',
    },
});
