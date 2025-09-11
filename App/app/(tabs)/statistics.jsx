import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import TestosteroneGauge from '../../components/TestosteroneGauge';
import { Ionicons } from '@expo/vector-icons';

const StatCard = ({ title, value, inRange }) => (
  <View style={styles.statCard}>
    <Text style={styles.statTitle}>{title}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={styles.statValue}>{value}</Text>
      <View style={[styles.dot, { backgroundColor: inRange ? '#4CAF50' : '#FFC107' }]} />
    </View>
  </View>
);

const FocusAreaCard = ({ icon, title, text }) => (
  <View style={styles.challengeCard}>
    <View style={styles.challengeHeader}>
      <Ionicons name={icon} size={20} color="#8A95B6" />
      <Text style={styles.challengeTitle}>{title}</Text>
    </View>
    <Text style={styles.challengeText}>{text}</Text>
  </View>
);

export default function StatisticsScreen() {
  const testosteroneLevel = 650; // Example value
  const dietScore = 85; // Example score
  const exerciseScore = 92; // Example score
  const sleepScore = 78; // Example score

  return (
    <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <TestosteroneGauge value={testosteroneLevel} />
          
          <View style={styles.statsContainer}>
            <StatCard title="Diet" value={`${dietScore}%`} inRange={dietScore > 80} />
            <StatCard title="Exercise" value={`${exerciseScore}%`} inRange={exerciseScore > 80} />
            <StatCard title="Sleep" value={`${sleepScore}%`} inRange={sleepScore > 80} />
          </View>

          <View style={styles.focusContainer}>
            <Text style={styles.focusTitle}>FOCUS AREAS</Text>
            <FocusAreaCard 
              icon="moon-outline"
              title="Sleep Consistency"
              text="Aim for a consistent bedtime and wake-up time to better regulate your circadian rhythm."
            />
            <FocusAreaCard 
              icon="restaurant-outline"
              title="Late-night Eating"
              text="Avoid large meals and processed foods 2-3 hours before bed to improve sleep quality."
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 30,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 30,
  },
  statCard: {
    alignItems: 'center',
  },
  statTitle: {
    color: '#8A95B6',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  focusContainer: {
    width: '100%',
    marginTop: 30,
  },
  focusTitle: {
    color: '#8A95B6',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  challengeCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 15,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  challengeText: {
    color: '#B3B8C8',
    fontSize: 14,
    lineHeight: 20,
  },
});
