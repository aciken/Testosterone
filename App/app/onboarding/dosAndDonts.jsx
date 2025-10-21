import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { dailyDos, dailyDonts } from '../../data/programData';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const SPACING = (width - CARD_WIDTH) / 2;

const allHabits = [
  ...dailyDos,
  ...dailyDonts
];

const habits = allHabits.slice(0, 4);

const HabitCard = ({ item, scrollX, index }) => {
  const inputRange = [(index - 1) * CARD_WIDTH, index * CARD_WIDTH, (index + 1) * CARD_WIDTH];
  
  const scale = scrollX.interpolate({ inputRange, outputRange: [0.85, 1, 0.85], extrapolate: 'clamp' });
  const opacity = scrollX.interpolate({ inputRange, outputRange: [0.6, 1, 0.6], extrapolate: 'clamp' });
  const imageTranslateX = scrollX.interpolate({ inputRange, outputRange: [-width * 0.15, 0, width * 0.15], extrapolate: 'clamp' });

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale }], opacity }]}>
      <Animated.Image source={item.image} style={[styles.cardImage, { transform: [{ translateX: imageTranslateX }] }]} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
        style={styles.cardOverlay}
      >
        <View>
          <Text style={styles.cardTitle}>{item.task}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
        </View>
      </LinearGradient>
      <View style={styles.cardBorder} />
    </Animated.View>
  );
};

export default function DosAndDonts() {
  const router = useRouter();
  const [buttonVisible, setButtonVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(0)).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex > 0 && newIndex <= habits.length) {
        setCurrentIndex(newIndex - 1); // Adjust for spacer
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      if (newIndex >= habits.length && !buttonVisible) { 
        setButtonVisible(true);
        Animated.spring(buttonScaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
      }
    }
  }).current;

  return (
    <LinearGradient colors={['#2A1A0A', '#1A1108', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Increase Testosterone</Text>
          <Text style={styles.headerSubtitle}>Swipe to discover key habits</Text>
        </View>

        <View style={styles.contentContainer}>
          <Animated.FlatList
            style={{ height: height * 0.55 }} // This centers the carousel
            data={[{id: 'left-spacer'}, ...habits, {id: 'right-spacer'}]}
            renderItem={({ item, index }) => {
              if (item.id === 'left-spacer' || item.id === 'right-spacer') return <View style={{ width: SPACING }} />;
              return <HabitCard item={item} scrollX={scrollX} index={index - 1} />;
            }}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH}
            decelerationRate="fast"
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ viewableItemsChanged: true, itemVisiblePercentThreshold: 50 }}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
            scrollEventThrottle={16}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.dotsContainer}>
            {allHabits.map((_, index) => {
              const isActive = index === currentIndex;
              const isOneOfTheLastThree = index >= allHabits.length - 3;
              return (
                <View 
                  key={index} 
                  style={[
                    styles.dot, 
                    isActive ? styles.activeDot : {},
                    buttonVisible && isOneOfTheLastThree && !isActive ? styles.futureDot : {}
                  ]} 
                />
              );
            })}
          </View>
          {buttonVisible &&
            <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
              <TouchableOpacity 
                style={styles.continueButton} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/onboarding/ranksInfo');
                }}
              >
                <Text style={styles.continueButtonText}>I Want More</Text>
              </TouchableOpacity>
            </Animated.View>
          }
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'space-around' },
  header: { 
    alignItems: 'center', 
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 16, marginTop: 4 },
  contentContainer: {
    // This container now just holds the list, centering is handled by the safeArea
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: height * 0.5, // Reduced height for better centering
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  cardImage: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    resizeMode: 'cover',
  },
  cardOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    borderRadius: 30, // Match parent borderRadius
  },
  cardBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    lineHeight: 22,
  },
  footer: { 
    minHeight: 120, // Use minHeight to ensure space for the button
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  futureDot: {
    backgroundColor: 'rgba(248, 113, 113, 0.5)',
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
  },
  continueButtonText: { color: '#0E0E0E', fontSize: 18, fontWeight: 'bold' },
});
