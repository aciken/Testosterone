import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const programDay = 4;

  const [todos, setTodos] = useState([
    { id: '1', task: 'Morning sunlight', frequency: 'Everyday', difficulty: 'Easy', streak: 10, image: require('../../assets/ForestImage.png'), completed: false },
    { id: '2', task: 'High-intensity workout', frequency: '3x/week', difficulty: 'Hard', streak: 5, image: require('../../assets/MountainImage.png'), completed: false },
    { id: '3', task: 'Eat a protein-rich meal', frequency: 'Everyday', difficulty: 'Easy', streak: 3, image: require('../../assets/FireImage.png'), completed: false },
    { id: '4', task: 'Cold shower', frequency: 'Everyday', difficulty: 'Medium', streak: 12, image: require('../../assets/CarImage.png'), completed: false },
    { id: '5', task: '8 hours of quality sleep', frequency: 'Everyday', difficulty: 'Easy', streak: 2, image: require('../../assets/GraphitImage.png'), completed: false },
  ]);

  const widthAnim = useRef(new Animated.Value(0)).current;

  const completedCount = todos.filter(t => t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleToggleTodo = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.dayLabel}>DAY</Text>
            <Text style={styles.dayNumber}>{programDay}</Text>
            <View style={styles.progressContainer}>
              <Animated.View style={[styles.progressBar, { width: animatedWidth }]}>
                {progress > 15 && (
                  <Text style={styles.progressText}>{`${Math.round(progress)}%`}</Text>
                )}
              </Animated.View>
            </View>
          </View>
          
          <View>
            {todos.map(todo => (
              <TouchableOpacity 
                key={todo.id} 
                style={[styles.todoCard, todo.completed && styles.todoCardCompleted]}
                onPress={() => handleToggleTodo(todo.id)}
              >
                <ImageBackground source={todo.image} style={styles.imageBackground} imageStyle={styles.imageStyle}>
                  <LinearGradient
                    colors={todo.completed ? ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.8)'] : ['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
                    style={styles.gradient}
                  >
                    <View style={styles.streakContainer}>
                      <Ionicons name="flame" size={14} color="#FFA500" />
                      <Text style={styles.streakText}>{todo.streak}d</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={[styles.todoTitle, todo.completed && styles.todoTitleCompleted]}>{todo.task}</Text>
                      <View style={styles.detailsContainer}>
                        <Ionicons name="repeat" size={14} color="rgba(255, 255, 255, 0.8)" />
                        <Text style={styles.detailText}>{todo.frequency}</Text>
                        <Ionicons name="stats-chart" size={14} color="rgba(255, 255, 255, 0.8)" />
                        <Text style={styles.detailText}>{todo.difficulty}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </ImageBackground>
                {todo.completed && (
                  <View style={styles.completionOverlay}>
                    <Ionicons name="checkmark-circle" size={60} color="rgba(255, 255, 255, 0.9)" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { paddingVertical: 20, paddingHorizontal: 20 },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  dayLabel: {
    color: '#8A95B6',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  dayNumber: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: 'bold',
    lineHeight: 80,
  },
  progressContainer: {
    width: '80%',
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginTop: 15,
    justifyContent: 'center',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
  progressText: {
    color: '#101010',
    fontSize: 14,
    fontWeight: 'bold',
  },
  todoCard: {
    height: 160,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  todoCardCompleted: {
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'space-between',
  },
  imageStyle: {
    borderRadius: 20,
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  streakText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 12,
  },
  cardContent: {
    alignItems: 'flex-start',
  },
  todoTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  detailText: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 5,
    marginRight: 16,
    fontSize: 12,
    fontWeight: '500',
  },
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 