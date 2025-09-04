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
      if (isLastQuestion) {
        router.replace('/onboarding/calculating'); // Navigate to calculating screen
      } else {
        router.push(nextPage);
      }
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
                <View style={styles.answerNumberContainer}>
                  <Text style={styles.answerNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.answerText}>{answer}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default function Question12() {
  return (
    <OnboardingQuestion
      questionNumber={12}
      question="How often do you feel like you don't have energy?"
      answers={['Almost every day', 'A few times a week', 'Occasionally', 'Rarely']}
      nextPage="/onboarding/question13"
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAnswer: {
    borderColor: '#FFFFFF',
  },
  answerNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  answerNumber: {
    color: '#121529',
    fontWeight: 'bold',
    fontSize: 16,
  },
  answerText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});
