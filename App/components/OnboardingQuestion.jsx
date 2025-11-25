import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import ProgressBar from './ProgressBar';
import { useOnboardingContext } from '../app/context/OnboardingContext';

const TOTAL_QUESTIONS = 13;

const OnboardingQuestion = ({ questionNumber, question, answers, nextPage, isLastQuestion = false }) => {
  const router = useRouter();
  const { saveAnswer } = useOnboardingContext();
  const [selected, setSelected] = useState(null);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const answerAnims = useRef(answers.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      ...answerAnims.map(anim => Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }))
    ];
    Animated.stagger(100, animations).start();
  }, []);

  const handleAnswerSelect = (answer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(answer);
    saveAnswer(questionNumber, answer);
    setTimeout(() => {
      if (isLastQuestion) {
        router.replace('/onboarding/calculating');
      } else {
        router.push(nextPage);
      }
    }, 300);
  };

  const progress = (questionNumber / TOTAL_QUESTIONS) * 100;

  return (
    <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <ProgressBar progress={progress} />
        </View>

        <View style={styles.content}>
          <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <Text style={styles.questionNumber}>Question #{questionNumber}</Text>
            <Text style={styles.questionText}>{question}</Text>
          </Animated.View>

          <View style={styles.answersContainer}>
            {answers.map((answer, index) => (
              <Animated.View
                key={index}
                style={{
                  opacity: answerAnims[index],
                  transform: [{
                    translateY: answerAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }]
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.answerButton,
                    selected === answer && styles.selectedAnswer,
                  ]}
                  onPress={() => handleAnswerSelect(answer)}
                >
                  <Text style={styles.answerText}>{answer}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

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
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 50,
  },
  answersContainer: {
    width: '100%',
  },
  answerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'flex-start',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    borderColor: '#FFA500',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    shadowColor: '#FFA500',
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

export default OnboardingQuestion;
