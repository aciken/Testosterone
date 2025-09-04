import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Calculating() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/onboarding/results');
    }, 10000); // 10-second delay

    return () => clearTimeout(timer); // Cleanup the timer
  }, [router]);

  return (
    <LinearGradient colors={['#0C1126', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.text}>Calculating your results...</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 22,
    marginTop: 20,
  },
});

