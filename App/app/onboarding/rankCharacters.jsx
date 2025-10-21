import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

const ranksData = [
  { name: 'Bronze', characterImage: require('../../assets/BroneGuy.png'), badgeImage: require('../../assets/BronzeRank.png'), color: '#E6A66A' },
  { name: 'Silver', characterImage: require('../../assets/SilverGuy.png'), badgeImage: require('../../assets/SilverRank.png'), color: '#C0C0C0' },
  { name: 'Gold', characterImage: require('../../assets/GoldGuy.png'), badgeImage: require('../../assets/GoldRank.png'), color: '#FFD700' },
  { name: 'Diamond', characterImage: require('../../assets/DiamondGuy.png'), badgeImage: require('../../assets/DiamondRank.png'), color: '#E5E4E2' },
];

const RankBadge = ({ badgeImage, isActive, index, rankColor }) => {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1.2 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.5)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: isActive ? 1.2 : 1, friction: 5, useNativeDriver: true }).start();
    Animated.timing(opacityAnim, { toValue: isActive ? 1 : 0.5, duration: 300, useNativeDriver: true }).start();
  }, [isActive]);

  const angle = (index - 1.5) * 0.8; // Even more spread
  const y = 120 * Math.sin(angle); // Even more vertical distance
  const x = 20 * Math.cos(angle);

  return (
    <Animated.View style={[styles.badgeContainer, { transform: [{ scale: scaleAnim }, { translateX: x }, { translateY: y }], opacity: opacityAnim }]}>
      <Image source={badgeImage} style={styles.badgeImage} />
      <View style={[styles.badgeHighlight, { opacity: isActive ? 1 : 0, borderColor: rankColor, shadowColor: rankColor }]} />
    </Animated.View>
  );
};

export default function RankCharacters() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const characterAnims = useRef(ranksData.map(() => new Animated.Value(0))).current;
  const standPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start the stand pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(standPulseAnim, { toValue: 0.8, duration: 1500, useNativeDriver: true }),
        Animated.timing(standPulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    Animated.timing(characterAnims[currentIndex], { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [currentIndex]);

  const cycleRank = (direction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < ranksData.length) {
      Animated.timing(characterAnims[currentIndex], { toValue: 0, duration: 400, useNativeDriver: true }).start();
      setCurrentIndex(nextIndex);
    } else if (direction > 0 && nextIndex >= ranksData.length) {
      router.push('/onboarding/programPreview');
    }
  };

  return (
    <LinearGradient colors={['#2A1A0A', '#1A1108', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <BlurView intensity={50} tint="dark" style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Which legend will you become?</Text>
        </BlurView>

        <View style={styles.content}>
          <View style={styles.characterContainer}>
            <View style={styles.characterWrapper}>
              {ranksData.map((rank, index) => (
                <Animated.Image 
                  key={rank.name} 
                  source={rank.characterImage} 
                  style={[styles.characterImage, { opacity: characterAnims[index] }]} 
                />
              ))}
              <Animated.Image 
                source={require('../../assets/CharacterStand.png')} 
                style={[styles.portalImage, { opacity: standPulseAnim }]} 
              />
            </View>
          </View>

          <View style={styles.badgesColumn}>
            {ranksData.map((rank, index) => (
              <RankBadge key={rank.name} badgeImage={rank.badgeImage} isActive={index === currentIndex} index={index} rankColor={rank.color} />
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.navButton} onPress={() => cycleRank(-1)}>
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => cycleRank(1)}>
            <LinearGradient colors={['#FFC300', '#FF8C00']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.continueButton}>
              <Text style={styles.continueButtonText}>
                {currentIndex === ranksData.length - 1 ? "Start" : "Next"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  titleContainer: {
    margin: 20,
    padding: 15,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  content: { flexDirection: 'row', flex: 1, alignItems: 'center' },
  characterContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterWrapper: {
    width: '100%',
    height: '80%',
    position: 'relative',
  },
  characterImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute',
    bottom: '25%',
    zIndex: 10,
  },
  portalImage: {
    width: '100%',
    height: '50%',
    resizeMode: 'contain',
    position: 'absolute',
    bottom: '10%',
    zIndex: 1,
  },
  badgesColumn: {
    flex: 1,
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  badgeHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 35,
    borderWidth: 2,
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  navButton: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
  },
  navButtonText: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 18, fontWeight: 'bold' },
  continueButton: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#FF8C00',
    shadowRadius: 10,
    shadowOpacity: 0.5,
  },
  continueButtonText: { color: '#000000', fontSize: 18, fontWeight: 'bold' },
});
