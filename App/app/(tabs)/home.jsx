import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Asset } from 'expo-asset';
import TaskDetailModal from '../../components/TaskDetailModal';
import TodoCard from '../../components/TodoCard';
import programData from '../../data/programData';

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
                  {currentDay !== programDay ? (
                    <TouchableOpacity onPress={() => setCurrentDay(programDay)} style={styles.todayButton}>
                      <Text style={styles.todayText}>RETURN TO TODAY</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.isTodayText}>TODAY</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleDayChange(1)}
                style={[styles.arrowButton, currentDay >= programDay && styles.arrowButtonDisabled]}
                disabled={currentDay >= programDay}
              >
                <Ionicons name="chevron-forward" size={32} color={currentDay >= programDay ? '#555555' : '#FFFFFF'} />
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
  arrowButtonDisabled: {
    opacity: 0.3,
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
    alignItems: 'center',
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
  isTodayText: {
    color: '#8A95B6',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
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