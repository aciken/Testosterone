import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import programData from '../../data/programData';

const getDisplayValue = (task, progress) => {
    if (!task) return `${progress}%`;

    switch (task.type) {
        case 'slider':
            const value = (progress / 100) * task.goal;
            // Round to the nearest step for cleanliness
            const roundedValue = Math.round(value / task.step) * task.step;
            // Handle cases where step might be a decimal
            const finalValue = Number.isInteger(roundedValue) ? roundedValue : roundedValue.toFixed(1);
            return `${finalValue}${task.unit ? ` ${task.unit}` : ''}`;
        case 'simple':
            return progress === 100 ? 'Completed' : 'Incomplete';
        case 'meals':
            if (progress < 0) {
                return `Bad Meal (${Math.abs(progress)}%)`;
            } else if (progress === 100) {
                return 'Completed';
            } else {
                return 'Incomplete';
            }
        case 'checklist':
            const totalItems = task.checklist ? task.checklist.length : 4; // Default to 4 for supplements
            const completedItems = Math.round((progress / 100) * totalItems);
            return `${completedItems}/${totalItems}`;
        default:
            return `${progress}%`;
    }
};

const HistoryItem = ({ day, displayValue }) => (
    <View style={[styles.historyItem, displayValue === 'Not Logged' && styles.notLoggedItem]}>
        <Text style={styles.historyDay}>Day {day}</Text>
        <Text style={[styles.historyProgress, displayValue === 'Not Logged' && styles.notLoggedText]}>{displayValue}</Text>
    </View>
);

export default function FactorHistoryModal() {
  const router = useRouter();
  const { factorId } = useLocalSearchParams();
  
  const [history, setHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taskInfo, setTaskInfo] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
        if (!factorId) {
            setIsLoading(false);
            return;
        }

        try {
            // Find task details from programData
            const allTasks = [...programData[1].dos, ...programData[1].donts];
            const foundTask = allTasks.find(t => t.id === factorId);
            setTaskInfo(foundTask);

            const userString = await AsyncStorage.getItem('user');
            if (!userString) {
                setIsLoading(false);
                return;
            }
            
            const user = JSON.parse(userString);
            const dateCreated = new Date(user.dateCreated);
            const today = new Date();
            dateCreated.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            const programDuration = Math.ceil((today - dateCreated) / (1000 * 60 * 60 * 24)) + 1;

            const loggedTasks = user.tasks
                .filter(task => task.taskId === factorId)
                .reduce((map, task) => {
                    const taskDate = new Date(task.date);
                    const dayIndex = Math.round((taskDate - dateCreated) / (1000 * 60 * 60 * 24));
                    map[dayIndex] = task;
                    return map;
                }, {});

            const fullHistory = [];
            for (let i = programDuration - 1; i >= 0; i--) {
                const loggedTask = loggedTasks[i];
                fullHistory.push({
                    day: i + 1,
                    displayValue: loggedTask ? getDisplayValue(foundTask, loggedTask.progress) : 'Not Logged'
                });
            }
            
            if (fullHistory.length > 0) {
                setHistory(fullHistory);
            }
        } catch (error) {
            console.error("Failed to fetch factor history:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchHistory();
  }, [factorId]);

  return (
    <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{taskInfo ? taskInfo.task : 'History'}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close-circle" size={32} color="#888" />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
            {isLoading ? <ActivityIndicator size="large" color="#FFFFFF" />
            : history && history.length > 0 ? (
                <ScrollView contentContainerStyle={styles.historyList}>
                    {history.map(item => (
                        <HistoryItem key={item.day} day={item.day} displayValue={item.displayValue} />
                    ))}
                </ScrollView>
            ) : (
                <Text style={styles.placeholderText}>
                    No history found for this factor.
                </Text>
            )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
  },
  content: {
    flex: 1,
  },
  placeholderText: {
    color: '#8A95B6',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  historyList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  notLoggedItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  historyDay: {
    color: '#E0E0E0',
    fontSize: 16,
    fontWeight: '600',
  },
  historyProgress: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notLoggedText: {
    color: '#666',
    fontWeight: 'normal',
    fontStyle: 'italic',
  },
});
