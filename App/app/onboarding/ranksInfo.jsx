import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const ranks = [
  { name: 'Bronze', minScore: 250, image: require('../../assets/BronzeRank.png'), color: '#E6A66A' },
  { name: 'Silver', minScore: 351, image: require('../../assets/SilverRank.png'), color: '#C0C0C0' },
  { name: 'Gold', minScore: 601, image: require('../../assets/GoldRank.png'), color: '#FFD700' },
  { name: 'Diamond', minScore: 751, image: require('../../assets/DiamondRank.png'), color: '#E5E4E2' },
  { name: 'Champion', minScore: 901, image: require('../../assets/ChampionRank.png'), color: '#b91c1c' },
];

const RankItem = ({ rank, delay, isLast }) => {
  const slideAnim = useRef(new Animated.Value(30)).current; // Subtler animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, { toValue: 0, duration: 600, delay, useNativeDriver: true }).start();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.rankItem, { transform: [{ translateY: slideAnim }], opacity: fadeAnim }]}>
      {!isLast && 
        <LinearGradient 
          colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.0)']}
          style={styles.timelineConnector} 
        />
      }
      <LinearGradient colors={['#444', '#222']} style={styles.rankIconContainer}>
        <View style={[styles.rankIconBorder, { borderColor: rank.color, shadowColor: rank.color }]}>
          <Image source={rank.image} style={styles.rankImage} />
        </View>
      </LinearGradient>
      <View style={styles.rankDetails}>
        <Text style={[styles.rankName, { color: rank.color }]}>{rank.name}</Text>
        <Text style={styles.rankScore}>{rank.minScore}+ ng/dl</Text>
      </View>
    </Animated.View>
  );
};

export default function RanksInfo() {
  const router = useRouter();
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const totalAnimationTime = ranks.length * 150 + 600;
    Animated.timing(buttonFadeAnim, { toValue: 1, duration: 500, delay: totalAnimationTime, useNativeDriver: true }).start();
  }, []);

  return (
    <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Track Your Progress</Text>
          <Text style={styles.headerSubtitle}>Level up as you increase your score.</Text>
        </View>

        <View style={styles.ranksContainer}>
          {ranks.map((rank, index) => (
            <RankItem key={rank.name} rank={rank} delay={index * 150} isLast={index === ranks.length - 1} />
          ))}
        </View>

        <Animated.View style={[styles.footer, { opacity: buttonFadeAnim }]}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/onboarding/rankCharacters');
            }}
          >
            <LinearGradient colors={['#FFC300', '#FF8C00']} style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'space-between' },
  header: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20 },
  headerTitle: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
  headerSubtitle: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 18, marginTop: 8, textAlign: 'center' },
  ranksContainer: { paddingHorizontal: 30, flex: 1, justifyContent: 'center' },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 25,
  },
  timelineConnector: {
    position: 'absolute',
    left: 44,
    top: 90,
    width: 2,
    height: '100%',
  },
  rankIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankIconBorder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  rankImage: { width: 70, height: 70, resizeMode: 'contain' },
  rankDetails: { marginLeft: 25 },
  rankName: { fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  rankScore: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 16, fontWeight: '500', marginTop: 5 },
  footer: { padding: 20, paddingBottom: 40, alignItems: 'center' },
  continueButton: {
    paddingVertical: 18,
    paddingHorizontal: 80,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: { color: '#000000', fontSize: 18, fontWeight: 'bold' },
});
