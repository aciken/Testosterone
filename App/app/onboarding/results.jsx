import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function Results() {
  const router = useRouter();
  const userScore = 38;
  const averageScore = 62;
  const userHeightAnim = useRef(new Animated.Value(0)).current;
  const averageHeightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(userHeightAnim, {
        toValue: userScore / 100,
        duration: 3500,
        useNativeDriver: false,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(averageHeightAnim, {
        toValue: averageScore / 100,
        duration: 500,
        useNativeDriver: false,
        easing: Easing.out(Easing.quad),
      })
    ]).start();
  }, []);

  const animatedUserHeight = userHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const animatedAverageHeight = averageHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient colors={['#2D0C0E', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Analysis Complete</Text>
          <Text style={styles.subtitle}>
            Here's a look at your estimated testosterone levels.
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.chartContainer}>
            <View style={styles.barWrapper}>
              <View style={styles.bar}>
                <Animated.View style={[styles.userScoreBar, { height: animatedUserHeight }]}>
                  <LinearGradient
                    colors={['#B91C1C', '#F87171']}
                    style={{ flex: 1 }}
                  />
                </Animated.View>
              </View>
              <Text style={styles.barTitle}>Your T-Level</Text>
              <Text style={styles.barSubtitle}>{`${userScore * 10} ng/dl`}</Text>
            </View>
            <View style={styles.barWrapper}>
              <View style={styles.bar}>
                <Animated.View style={[styles.averageScoreBar, {height: animatedAverageHeight}]} />
              </View>
              <Text style={styles.barTitle}>Average</Text>
              <Text style={styles.barSubtitle}>{`${averageScore * 10} ng/dl`}</Text>
            </View>
          </View>

          <Text style={styles.comparisonText}>
            Your testosterone level is <Text style={{fontWeight: 'bold'}}>{`${averageScore - userScore}% lower`}</Text> than average.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={() => router.replace('/onboarding/declineInfo')}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    width: '100%',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  content: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    color: '#B3B8C8',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    height: 250,
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 60,
    height: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 10,
  },
  userScoreBar: {
    width: '100%',
  },
  averageScoreBar: {
    width: '100%',
    backgroundColor: '#4B5563',
  },
  barLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  barTitle: {
    color: '#B3B8C8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  glowingBarTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(239, 68, 68, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  barSubtitle: {
    color: '#B3B8C8',
    fontSize: 14,
    marginTop: 2,
  },
  comparisonText: {
    color: '#B3B8C8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    width: '90%',
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#121529',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

