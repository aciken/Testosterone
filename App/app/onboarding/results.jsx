import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function Results() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#0C1126', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Ionicons name="checkmark-circle-outline" size={100} color="#4CAF50" />
        <Text style={styles.title}>Analysis Complete</Text>
        <Text style={styles.subtitle}>
          Based on your answers, you have less than average testosterone.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/onboarding/declineInfo')}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 30,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  subtitle: {
    color: '#B3B8C8',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: '#121529',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

