import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import programData from '../../data/programData';
import { taskIcons } from '../../data/icons';

const getDisplayValue = (task, loggedTask) => {
    if (!task) return `${loggedTask.progress}%`;

    switch (task.type) {
        case 'slider':
            const maxValue = task.inverted ? task.maxValue : task.goal;
            const value = (loggedTask.progress / 100) * maxValue;
            const roundedValue = Math.round(value / task.step) * task.step;
            const finalValue = Number.isInteger(roundedValue) ? roundedValue : roundedValue.toFixed(1);
            return `${finalValue}${task.unit ? ` ${task.unit}` : ''}`;
        case 'checklist':
            const takenCount = loggedTask.checked ? loggedTask.checked.length : 0;
            return `${takenCount} of 4`;
        case 'simple':
            return loggedTask.progress >= 95 ? 'Completed' : 'Incomplete';
        case 'meals':
            if (loggedTask.history && loggedTask.history.length > 0) {
                const totalScore = loggedTask.history.reduce((sum, meal) => sum + meal.value, 0);
                const averageScore = Math.round(totalScore / loggedTask.history.length);
                if (averageScore >= 60) return 'Good';
                if (averageScore >= 30) return 'Average';
                return 'Bad';
            }
            return 'Incomplete';
        default:
            return `${loggedTask.progress}%`;
    }
};

const HistoryItem = ({ date, status, displayValue }) => {
    const isCompleted = status === 'completed';

    const containerStyle = [
        styles.historyItem,
        isCompleted && styles.completedItem,
    ];

    const dateTextStyle = [styles.historyDate, isCompleted && styles.completedText];
    const valueTextStyle = [styles.historyValue, isCompleted && styles.completedText];
    
    return (
        <View style={containerStyle}>
            {isCompleted && (
                <LinearGradient
                    colors={['#1A1A1A', '#402A00']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            )}
            <Text style={dateTextStyle}>{date}</Text>
            <Text style={valueTextStyle}>{displayValue}</Text>
        </View>
    );
};

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

            const loggedTasks = user.tasks
                .filter(task => task.taskId === factorId)
                .reduce((map, task) => {
                    const taskDate = new Date(task.date);
                    const dayIndex = Math.round((taskDate - dateCreated) / (1000 * 60 * 60 * 24));
                    map[dayIndex] = task;
                    return map;
                }, {});

            const fullHistory = [];
            for (let i = 0; i < 30; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dayIndex = Math.round((date - dateCreated) / (1000 * 60 * 60 * 24));

                if (dayIndex < 0) continue;

                const loggedTask = loggedTasks[dayIndex];
                let status = 'notLogged';
                let displayValue = 'Not Logged';

                if (loggedTask) {
                    displayValue = getDisplayValue(foundTask, loggedTask);

                    if (foundTask.id === '3') { // meals
                        if (displayValue === 'Good') {
                            status = 'completed';
                        } else if (displayValue === 'Average') {
                            status = 'partial';
                        } else {
                            status = 'missed';
                        }
                    } else if (foundTask.inverted) {
                        status = loggedTask.progress < 50 ? 'completed' : 'missed';
                    } else {
                        if (loggedTask.progress >= 95) status = 'completed';
                        else if (loggedTask.progress > 5) status = 'partial';
                        else status = 'missed';
                    }
                }
                
                fullHistory.push({
                    key: date.toISOString(),
                    date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
                    status: status,
                    displayValue: displayValue,
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
    <LinearGradient colors={['#1C1C1E', '#000000']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
            {taskInfo && <Image source={taskIcons[factorId]} style={styles.headerIcon} />}
          <Text style={styles.headerTitle}>{taskInfo ? taskInfo.task : 'History'}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close-circle" size={32} color="#333333" />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
            {isLoading ? <ActivityIndicator size="large" color="#FFFFFF" />
            : history && history.length > 0 ? (
                <ScrollView contentContainerStyle={styles.historyList}>
                    {history.map(({ key, ...rest }) => (
                        <HistoryItem key={key} {...rest} />
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
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerIcon: {
    width: 30,
    height: 30,
    marginRight: 15,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
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
    padding: 20,
  },
  historyList: {
    padding: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 25,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  completedItem: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 140, 0, 0.3)',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  historyDate: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '500',
  },
  historyValue: {
    color: '#A8A8A8',
    fontSize: 16,
    fontWeight: '500',
  },
  completedText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
