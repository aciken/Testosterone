import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const TOTAL_QUESTIONS = 13;

const OnboardingQuestion = ({ questionNumber, question, answers, nextPage, isLastQuestion = false }) => {
  const router = useRouter();
  const [selected, setSelected] = useState(null);

  const handleAnswerSelect = (answer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(answer);

    setTimeout(() => {
      router.push(nextPage);
    }, 300);
  };

  const progress = (questionNumber / TOTAL_QUESTIONS) * 100;

  return (
    <LinearGradient colors={['#0C1126', '#000000']} style={styles.container}>
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.questionNumber}>Question #{questionNumber}</Text>
          <Text style={styles.questionText}>{question}</Text>

          <View style={styles.answersContainer}>
            {answers.map((answer, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.answerButton,
                  selected === answer && styles.selectedAnswer,
                ]}
                onPress={() => handleAnswerSelect(answer)}
              >
                <Text style={styles.answerText}>{answer}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default function Question6() {
  return (
    <OnboardingQuestion
      questionNumber={6}
      question="What kind of exercise do you do?"
      answers={['Cardio (running, cycling)', 'Weightlifting', 'Team sports', "I don't exercise"]}
      nextPage="/onboarding/question7"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  backButton: {
    padding: 10,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#1E2747',
    borderRadius: 4,
    marginLeft: 15,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  content: {
    flex: 1,
    width: '100%',
    marginTop: 60,
  },
  questionNumber: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  questionText: {
    color: '#B3B8C8',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 50,
  },
  answersContainer: {
    width: '100%',
  },
  answerButton: {
    backgroundColor: '#1E2747',
    borderRadius: 15,
    padding: 20,
    alignItems: 'flex-start',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedAnswer: {
    borderColor: '#FFFFFF',
    backgroundColor: '#2A3A5C',
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  answerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
