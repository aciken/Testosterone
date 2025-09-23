import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import TaskDetailModal from '../../components/TaskDetailModal';
import TodoCard from '../../components/TodoCard';
import programData from '../../data/programData';
import StreakNotification from '../../components/StreakNotification';
import { taskIcons } from '../../data/icons';

export default function HomeScreen() {
  const [programDay, setProgramDay] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [todosByDay, setTodosByDay] = useState(programData);
  const [isDayChanging, setIsDayChanging] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dailyNgDlChange, setDailyNgDlChange] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [notification, setNotification] = useState(null);
  const notificationAnim = useRef(new Animated.Value(-150)).current;

  const widthAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const getProgramDay = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString);
          const dateCreated = new Date(user.dateCreated);
          const today = new Date();
          
          // Set both dates to the start of the day for an accurate difference
          dateCreated.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          const diffTime = Math.abs(today - dateCreated);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          
          setProgramDay(diffDays);
          setCurrentDay(diffDays);
          
          // Load saved tasks from user and merge with programData
          if (user.tasks && user.tasks.length > 0) {
            const newTodosByDay = JSON.parse(JSON.stringify(programData)); // Deep copy to avoid mutation

            user.tasks.forEach(savedTask => {
              const taskDate = new Date(savedTask.date);
              const startDate = new Date(dateCreated);
              startDate.setHours(0, 0, 0, 0);
              taskDate.setHours(0, 0, 0, 0);

              const dayIndex = Math.ceil((taskDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

              if (newTodosByDay[dayIndex]) {
                const findAndupdateTask = (taskArray) => {
                  if (!taskArray) return;
                  const taskIndex = taskArray.findIndex(t => t.id === savedTask.taskId);
                  if (taskIndex > -1) {
                    taskArray[taskIndex].progress = savedTask.progress;
                    if (savedTask.checked) {
                      taskArray[taskIndex].checked = savedTask.checked;
                    }
                  }
                };
                findAndupdateTask(newTodosByDay[dayIndex].dos);
                findAndupdateTask(newTodosByDay[dayIndex].donts);
              }
            });
            setTodosByDay(newTodosByDay);
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };

    getProgramDay();
  }, []);

  const currentDayData = todosByDay[currentDay] || { dos: [], donts: [] };
  const currentDos = currentDayData.dos || [];
  const currentDonts = currentDayData.donts || [];

  const positiveProgress = currentDos.reduce((sum, todo) => sum + Math.min(todo.progress || 0, 100), 0);
  const negativeProgress = currentDonts.reduce((sum, todo) => sum + (todo.progress || 0), 0);
  const totalPossiblePositive = currentDos.length * 100;

  const progress = totalPossiblePositive > 0 
    ? ((positiveProgress - negativeProgress) / totalPossiblePositive) * 100
    : -negativeProgress / (currentDonts.length * 100) * 100;

  useEffect(() => {
    const dayData = todosByDay[currentDay] || { dos: [], donts: [] };
    const dos = dayData.dos || [];
    const donts = dayData.donts || [];

    const posProgress = dos.reduce((sum, todo) => sum + Math.min(todo.progress || 0, 100), 0);
    const negProgress = donts.reduce((sum, todo) => sum + (todo.progress || 0), 0);
    const totalPossible = dos.length * 100;
    
    const newProgress = totalPossible > 0 
      ? ((posProgress - negProgress) / totalPossible) * 100
      : -negProgress / (donts.length * 100) * 100;

    Animated.timing(widthAnim, {
      toValue: newProgress,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [currentDay, todosByDay]);

  useEffect(() => {
    if (notification) {
      Animated.sequence([
        Animated.spring(notificationAnim, {
          toValue: insets.top + 10,
          tension: 40,
          friction: 14,
          useNativeDriver: false,
        }),
        Animated.delay(3000),
        Animated.spring(notificationAnim, {
          toValue: -150,
          tension: 40,
          friction: 14,
          useNativeDriver: false,
        }),
      ]).start(() => setNotification(null));
    }
  }, [notification]);

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
      
      const isDo = (todosByDay[currentDay].dos || []).some(t => t.id === saveData.id);

      if (isDo) {
        const newDos = (todosByDay[currentDay].dos || []).map(todo =>
          todo.id === saveData.id ? { ...todo, ...saveData } : todo
        );
        setTodosByDay(prevData => ({
          ...prevData,
          [currentDay]: { ...prevData[currentDay], dos: newDos },
        }));
      } else {
        const newDonts = (todosByDay[currentDay].donts || []).map(todo =>
          todo.id === saveData.id ? { ...todo, ...saveData } : todo
        );
        setTodosByDay(prevData => ({
          ...prevData,
          [currentDay]: { ...prevData[currentDay], donts: newDonts },
        }));
      }
      
      sendTaskUpdate(saveData);
      checkAndTriggerStreakNotification(saveData);
    }
  };

  const checkAndTriggerStreakNotification = async (taskData) => {
    if (!taskData) return;

    const { id, task, progress } = taskData;
    const taskInfo = [...programData[1].dos, ...programData[1].donts].find(t => t.id === id);
    if (!taskInfo) return;

    const isSuccess = taskInfo.inverted ? progress < 50 : progress >= 50;
    if (!isSuccess) return;

    try {
        const userString = await AsyncStorage.getItem('user');
        if (!userString) return;

        const user = JSON.parse(userString);
        const userTasks = user.tasks || [];

        const taskLogs = userTasks.filter(t => t.taskId === id);

        const successTimestamps = new Set();
        taskLogs.forEach(log => {
            const logTaskInfo = [...programData[1].dos, ...programData[1].donts].find(t => t.id === log.taskId);
            if (logTaskInfo) {
                const success = logTaskInfo.inverted ? log.progress < 50 : log.progress >= 50;
                if (success) {
                    const date = new Date(log.date);
                    date.setHours(0, 0, 0, 0);
                    successTimestamps.add(date.getTime());
                }
            }
        });
        
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Add today's success manually for calculation
        successTimestamps.add(today.getTime());

        let currentDate = new Date(today);
        
        while (successTimestamps.has(currentDate.getTime())) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        }
        
        if (streak > 0) {
            setNotification({
                title: streak === 1 ? 'Streak Started!' : 'Streak Growing!',
                message: taskInfo.task,
                streakCount: streak,
                icon: taskIcons[id],
            });
        }
    } catch (error) {
        console.error("Failed to check streak:", error);
    }
  };

  const sendTaskUpdate = async (taskData) => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        const updatePayload = {
          userId: user._id,
          date: new Date(),         
          task: taskData,
        };

        console.log("Sending task update:", updatePayload);
        const response = await axios.post('https://c2a84c913aba.ngrok-free.app/tasks/update', updatePayload);
        console.log("Update response:", response.data);

        if (response.data && response.data.tasks) {
          const updatedUser = { ...user, tasks: response.data.tasks };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          console.log("User updated in AsyncStorage");
        }
      }
    } catch (error) {
      console.error("Failed to send task update:", error);
    }
  };

  const handleDayChange = (direction) => {
    const newDay = currentDay + direction;
    if (todosByDay[newDay] && !isDayChanging) {
      setIsDayChanging(true); // Show loader immediately

      const nextDayTasks = [...(todosByDay[newDay].dos || []), ...(todosByDay[newDay].donts || [])];
      const imagesToLoad = nextDayTasks.map(task => task.image).filter(Boolean);

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

  const positiveWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const negativeWidth = widthAnim.interpolate({
    inputRange: [-100, 0],
    outputRange: ['100%', '0%'],
    extrapolate: 'clamp',
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
              <Animated.View style={[styles.negativeProgressBar, { width: negativeWidth }]} />
              <Animated.View style={[styles.progressBar, { width: positiveWidth }]} />
              <Text style={[styles.progressText, { color: progress >= 45 && progress > 0 ? '#101010' : '#FFFFFF' }]}>
                {`${Math.round(progress)}%`}
              </Text>
            </View>
          </View>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DO'S</Text>
          </View>

          <View style={styles.listContainer}>
            {isDayChanging ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <Animated.View style={{ opacity: listOpacity, transform: [{ scale: listScale }] }}>
                {currentDos.map(todo => (
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

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DON'TS</Text>
          </View>

          <View style={styles.listContainer}>
             {isDayChanging ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <Animated.View style={{ opacity: listOpacity, transform: [{ scale: listScale }] }}>
                {currentDonts.map(todo => (
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
      {notification && (
        <Animated.View style={[styles.notificationContainer, { top: notificationAnim }]}>
            <StreakNotification
                title={notification.title}
                message={notification.message}
                streakCount={notification.streakCount}
                icon={notification.icon}
            />
        </Animated.View>
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
    position: 'relative', // Added for positioning bars
  },
  sectionHeader: {
    width: '100%',
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#8A95B6',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  listContainer: {
    minHeight: 100,
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
    position: 'absolute',
  },
  negativeProgressBar: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 8,
    position: 'absolute',
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: 'bold',
  },
  dontCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  dontCardText: {
    color: '#FFD1D1',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
  },
  notificationContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
}); 