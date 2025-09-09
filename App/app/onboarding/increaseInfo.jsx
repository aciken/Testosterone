import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function IncreaseInfo() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#4A90E2', '#7BB3F0']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Image source={require('../../assets/Cartoon6.1.png')} style={styles.image} />
        
        <Text style={styles.title}>It's possible</Text>
        
        <Text style={styles.description}>
          You can naturally boost your testosterone levels through proven methods.
        </Text>

        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        
        <TouchableOpacity style={styles.button} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/onboarding/dietExerciseInfo');
        }}>
          <Text style={styles.buttonText}>Next</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#000" />
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginTop: 40,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 30,
    marginBottom: 40,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5,
  },
});
