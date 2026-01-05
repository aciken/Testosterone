import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useOnboardingContext } from '../context/OnboardingContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BenefitItem = ({ text }) => (
  <View style={styles.benefitItem}>
    <Ionicons name="checkmark-circle" size={24} color="#FFA500" />
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

const ProgramGraph = ({ currentT, potentialT }) => (
  <View style={styles.graphContainer}>
    <Text style={styles.graphTitle}>Your Testosterone Journey</Text>
    
    <View style={styles.statsContainer}>
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Current</Text>
        <Text style={styles.statValue}>{currentT} ng/dL</Text>
      </View>
      <Ionicons name="arrow-forward" size={20} color="#666" style={{ marginTop: 20 }} />
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Potential</Text>
        <Text style={[styles.statValue, { color: '#FFA500' }]}>{potentialT} ng/dL</Text>
      </View>
    </View>

    <View style={{ height: 100, alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
      <Svg height="100%" width="100%" viewBox="0 0 100 50">
        <Defs>
          <SvgGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FFA500" stopOpacity="0.5" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="1" />
          </SvgGradient>
        </Defs>
        <Path 
          d="M 0 40 Q 25 5, 50 20 T 100 10" 
          fill="none" 
          stroke="url(#grad)" 
          strokeWidth="3" 
          strokeLinecap="round"
        />
        {/* Glowing dot at the end */}
        <Path d="M 99 10 A 1 1 0 0 1 99 10" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="4" strokeOpacity="0.5" />
      </Svg>
    </View>
  </View>
);

export default function ProgramPreview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { score, setScore } = useOnboardingContext();
  const [currentScore, setCurrentScore] = useState(score);
  const hasTriggeredRef = useRef(false);
  
  // Load persisted score if context is lost (e.g. app restart)
  useEffect(() => {
    const loadScore = async () => {
      if (score > 0) {
        setCurrentScore(score);
        return;
      }

      try {
        const savedScore = await AsyncStorage.getItem('onboarding_score');
        if (savedScore) {
          const parsed = parseFloat(savedScore);
          if (!isNaN(parsed) && parsed > 0) {
            setCurrentScore(parsed);
            if (setScore) setScore(parsed);
          }
        }
      } catch (e) {
        console.error("Failed to load score", e);
      }
    };
    loadScore();
  }, [score]);
  
  useEffect(() => {
    if (params?.triggerWheel === 'true' && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      const timer = setTimeout(() => {
        router.push('/onboarding/rewardWheel');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [params]);

  const currentT = Math.round(currentScore * 10);
  // Calculate potential: cap at 1000 or 2.2x current, whichever is reasonable, 
  // ensuring it's always higher than current. 
  // Using similar logic to results page: Math.min(score * 2.2, 100) * 10 => max 1000
  const potentialT = Math.round(Math.min(currentT * 2.2, 1000));

  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + 90);
  const formattedDate = completionDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <LinearGradient colors={['#2A1A0A', '#1A1108', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Ionicons name="checkmark-circle-outline" size={40} color="#FFA500" style={styles.mainIcon} />
          
          <Text style={styles.mainTitle}>In just 90 days, you'll take your first real step toward becoming a real man.</Text>
          <Text style={styles.subtitle}>Your journey to true manhood begins now. These are the milestones that await you:</Text>

          <View style={styles.dateChip}>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>

          <BenefitItem text="Your physical strength will drastically improve" />
          <BenefitItem text="Your endurance and discipline will be 3x stronger" />
          <BenefitItem text="You will feel more motivated and energized than ever" />
          <BenefitItem text="Your dopamine reward system will be refreshed" />

          <ProgramGraph currentT={currentT} potentialT={potentialT} />

        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/utils/Paywall');
            }}
          >
            <LinearGradient colors={['#FFC300', '#FF8C00']} style={styles.buttonGradient}>
              <Text style={styles.continueButtonText}>Start My Program</Text>
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
  scrollContent: { padding: 24, paddingBottom: 120 },
  mainIcon: {
    textAlign: 'center',
    marginBottom: 20,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    color: '#D3D3D3',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  dateChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  benefitText: {
    color: '#E0E0E0',
    fontSize: 17,
    marginLeft: 12,
    flex: 1,
    lineHeight: 24,
  },
  graphContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  graphTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  continueButton: {
    borderRadius: 30,
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 30,
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
