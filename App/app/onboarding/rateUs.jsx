import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REVIEW_FLAG_KEY = 'hasRequestedStoreReview_v1';

export default function RateUs() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const next = typeof params?.next === 'string' ? params.next : '/onboarding/journeyGraph';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    let timeoutId;
    const run = async () => {
      try {
        const alreadyAsked = await AsyncStorage.getItem(REVIEW_FLAG_KEY);
        if (alreadyAsked === 'true') return;

        // Lazy-require so the app doesn't crash if the native module
        // isn't included in the currently installed build.
        let StoreReview;
        try {
          // eslint-disable-next-line global-require
          StoreReview = require('expo-store-review');
        } catch {
          return;
        }

        const canAsk = await StoreReview.hasAction();
        if (!canAsk) return;

        await AsyncStorage.setItem(REVIEW_FLAG_KEY, 'true');
        await StoreReview.requestReview();
      } catch {
        // If anything fails, don't block onboarding.
      }
    };

    // Delay so the screen renders before the system prompt.
    timeoutId = setTimeout(run, 700);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace(next);
  };

  return (
    <LinearGradient
      colors={['#0A0A0D', '#1A0F08', '#000000']}
      locations={[0, 0.6, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.title}>Quick question</Text>
          <Text style={styles.subtitle}>
            If this feels like the start of a real change, would you rate the app?
          </Text>
          <Text style={styles.note}>
            It helps us grow, and we’ll keep improving the program.
          </Text>
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={handleContinue} activeOpacity={0.9}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'space-between' },
  header: { width: '100%', paddingHorizontal: 20, paddingTop: 10 },
  backButton: { padding: 10, alignSelf: 'flex-start' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 },
  title: { color: '#FFFFFF', fontSize: 34, fontWeight: '900', textAlign: 'center', letterSpacing: 0.5 },
  subtitle: { color: '#D1D5DB', fontSize: 16, textAlign: 'center', marginTop: 14, lineHeight: 24 },
  note: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginTop: 14, lineHeight: 22 },
  footer: { paddingHorizontal: 30, paddingBottom: 40, minHeight: 150, justifyContent: 'flex-end' },
  button: { backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 30 },
  buttonText: { color: '#0E0E0E', fontSize: 18, fontWeight: 'bold' },
});


