import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Asset } from 'expo-asset';
import TaskDetailModal from '../../components/TaskDetailModal';
import TodoCard from '../../components/TodoCard';

const programData = {
  4: [ // Today's data
    { id: '1', task: 'Time spent in the sun', type: 'slider', goal: 30, unit: 'minutes', maxValue: 480, step: 15, streak: 10, image: require('../../assets/Sunrise.png'), progress: 0 },
    { id: '2', task: 'High-intensity workout', type: 'simple', streak: 5, image: require('../../assets/Workout.png'), progress: 0 },
    { id: '3', task: 'Eat a protein-rich meal', type: 'meals', streak: 3, image: require('../../assets/Meal.png'), progress: 0, meals: [{ id: 'm1', name: 'Breakfast', food: '' }, { id: 'm2', name: 'Lunch', food: '' }, { id: 'm3', name: 'Dinner', food: '' }] },
    { id: '4', task: '8 hours of quality sleep', type: 'slider', goal: 8, unit: 'hours', maxValue: 12, step: 1, streak: 2, image: require('../../assets/Sleep.png'), progress: 0 },
    { id: '5', task: 'Take your supplements', type: 'checklist', streak: 0, image: require('../../assets/Suplements.png'), progress: 0, checklist: [{ id: 'c1', name: 'Zinc', done: false }, { id: 'c2', name: 'Magnesium', done: false }, { id: 'c3', name: 'Ashwagandha', done: false }, { id: 'c4', name: 'Creatine', done: false }] },
  ],
  3: [ // Yesterday's data
    { id: '1', task: 'Time spent in the sun', type: 'slider', goal: 30, unit: 'minutes', maxValue: 480, step: 15, streak: 9, image: require('../../assets/Sunrise.png'), progress: 100 },
    { id: '2', task: 'Eat a protein-rich meal', type: 'meals', streak: 2, image: require('../../assets/Meal.png'), progress: 100, meals: [{ id: 'm1', name: 'Breakfast', food: 'Eggs & Bacon' }, { id: 'm2', name: 'Lunch', food: 'Steak Salad' }, { id: 'm3', name: 'Dinner', food: 'Chicken & Veg' }] },
    { id: '3', task: 'Active recovery', type: 'simple', streak: 1, image: require('../../assets/ForestImage.png'), progress: 100 },
    { id: '4', task: '8 hours of quality sleep', type: 'slider', goal: 8, unit: 'hours', maxValue: 12, step: 1, streak: 1, image: require('../../assets/Sleep.png'), progress: 88 },
  ],
  5: [ // Tomorrow's data
    { id: '1', task: 'Time spent in the sun', type: 'slider', goal: 30, unit: 'minutes', maxValue: 480, step: 15, streak: 10, image: require('../../assets/Sunrise.png'), progress: 0 },
    { id: '2', task: 'Eat a protein-rich meal', type: 'meals', streak: 3, image: require('../../assets/Meal.png'), progress: 0, meals: [{ id: 'm1', name: 'Breakfast', food: '' }, { id: 'm2', name: 'Lunch', food: '' }, { id: 'm3', name: 'Dinner', food: '' }] },
    { id: '3', task: 'Cold shower', type: 'simple', streak: 12, image: require('../../assets/CarImage.png'), progress: 0 },
    { id: '4', task: '8 hours of quality sleep', type: 'slider', goal: 8, unit: 'hours', maxValue: 12, step: 1, streak: 2, image: require('../../assets/Sleep.png'), progress: 0 },
  ],
};

export default function HomeScreen() {
  const programDay = 4; // The actual current day
  const [currentDay, setCurrentDay] = useState(programDay);
  const [todosByDay, setTodosByDay] = useState(programData);
  const [isDayChanging, setIsDayChanging] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const widthAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  const currentTodos = todosByDay[currentDay] || [];
  const totalProgress = currentTodos.reduce((sum, todo) => sum + (todo.progress || 0), 0);
  const progress = currentTodos.length > 0 ? totalProgress / (currentTodos.length * 100) * 100 : 0;

  useEffect(() => {
    const todosForDay = todosByDay[currentDay] || [];
    const total = todosForDay.reduce((sum, todo) => sum + (todo.progress || 0), 0);
    const newProgress = todosForDay.length > 0 ? total / (todosForDay.length * 100) * 100 : 0;

    Animated.timing(widthAnim, {
      toValue: newProgress,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [currentDay, todosByDay]);

  useEffect(() => {
    if (!isDayChanging) {
      // Fade in the list
      Animated.stagger(50, [
        Animated.spring(listAnim, {
          toValue: 1,
          tension: 40,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      listAnim.setValue(0);
    }
  }, [isDayChanging]);

  const handleTaskPress = (task) => {
    if (currentDay !== programDay || isDayChanging) return;
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleModalClose = (saveData) => {
    setModalVisible(false);
    setSelectedTask(null);

    if (saveData) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const newTodosForDay = (todosByDay[currentDay] || []).map(todo =>
        todo.id === saveData.id ? { ...todo, ...saveData } : todo
      );

      setTodosByDay(prevData => ({
        ...prevData,
        [currentDay]: newTodosForDay,
      }));
    }
  };

  const handleDayChange = (direction) => {
    const newDay = currentDay + direction;
    if (todosByDay[newDay] && !isDayChanging) {
      setIsDayChanging(true); // Show loader immediately

      const nextDayTasks = todosByDay[newDay];
      const imagesToLoad = nextDayTasks.map(task => task.image);

      const assetPromises = imagesToLoad.map(image => {
        return Asset.fromModule(image).downloadAsync();
      });

      Promise.all(assetPromises)
        .then(() => {
          // All images are pre-loaded, now update the view
          setCurrentDay(newDay);
          setIsDayChanging(false);
        })
        .catch(error => {
          console.warn('Error pre-loading images:', error);
          // Even if pre-loading fails, proceed to show the next day
          setCurrentDay(newDay);
          setIsDayChanging(false);
        });
    }
  };

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const listOpacity = listAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const listScale = listAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });

  return (
    <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <View style={styles.dayNavigator}>
              <TouchableOpacity onPress={() => handleDayChange(-1)} style={styles.arrowButton}>
                <Ionicons name="chevron-back" size={32} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.dayDisplay}>
                <Text style={styles.dayLabel}>DAY</Text>
                <Text style={styles.dayNumber}>{currentDay}</Text>
                <View style={styles.todayButtonContainer}>
                  {currentDay !== programDay && (
                    <TouchableOpacity onPress={() => setCurrentDay(programDay)} style={styles.todayButton}>
                      <Text style={styles.todayText}>RETURN TO TODAY</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDayChange(1)} style={styles.arrowButton}>
                <Ionicons name="chevron-forward" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.progressContainer}>
              <Animated.View style={[styles.progressBar, { width: animatedWidth }]} />
              <Text style={[styles.progressText, { color: progress >= 45 ? '#101010' : '#FFFFFF' }]}>
                {`${Math.round(progress)}%`}
              </Text>
            </View>
          </View>
          
          <View style={styles.listContainer}>
            {isDayChanging ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <Animated.View style={{ opacity: listOpacity, transform: [{ scale: listScale }] }}>
                {currentTodos.map(todo => (
                  <TodoCard 
                    key={todo.id}
                    todo={todo}
                    onPress={() => handleTaskPress(todo)}
                    isEditable={currentDay === programDay}
                  />
                ))}
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      {selectedTask && (
        <TaskDetailModal
          isVisible={modalVisible}
          task={selectedTask}
          onClose={handleModalClose}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { 
    paddingVertical: 20, 
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra padding to clear the floating tab bar
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  dayNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  arrowButton: {
    padding: 10,
  },
  dayDisplay: {
    alignItems: 'center',
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
  todayButtonContainer: {
    height: 26,
    marginTop: 4,
    justifyContent: 'center',
  },
  todayButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 13,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  todayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  progressContainer: {
    width: '100%',
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginTop: 15,
  },
  listContainer: {
    minHeight: 400, // Ensure container has height for the spinner to be centered
    justifyContent: 'center',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 8,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 