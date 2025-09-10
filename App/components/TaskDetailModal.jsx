import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Easing, TouchableWithoutFeedback, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import SleepSlider from './SleepSlider';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const ChecklistItem = ({ item, onToggle }) => {
  const anim = useRef(new Animated.Value(item.done ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: item.done ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [item.done]);

  const textColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#888888', '#FFFFFF'],
  });

  const strikethroughWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <TouchableOpacity style={styles.checklistItem} onPress={() => onToggle(item.id)}>
      <View style={styles.checkboxContainer}>
        <Ionicons name="ellipse-outline" size={28} color="#888888" style={{ position: 'absolute' }} />
        <Animated.View style={{ transform: [{ scale: anim }] }}>
          <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
        </Animated.View>
      </View>
      <View>
        <Animated.Text style={[styles.checklistText, { color: textColor }]}>
          {item.name}
        </Animated.Text>
        <Animated.View style={[styles.strikethrough, { width: strikethroughWidth }]} />
      </View>
    </TouchableOpacity>
  );
};

const TaskDetailModal = ({ isVisible, task, onClose }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [checklistItems, setChecklistItems] = useState([]);
  const [mealInputs, setMealInputs] = useState([]);
  const slideAnim = useRef(new Animated.Value(500)).current;
  const blurAnim = useRef(new Animated.Value(0)).current;

  const getModalHeight = () => {
    if (!task) return '55%';
    switch (task.type) {
      case 'meals':
        return '75%';
      case 'checklist':
        return '65%';
      case 'sleep':
        return '55%';
      case 'simple':
        return '40%';
      default:
        return '55%';
    }
  };

  useEffect(() => {
    if (isVisible && task) {
      // Reset state based on task type
      switch (task.type) {
        case 'sleep':
          const initialValue = (task.progress / 100) * (task.goal || 1);
          setCurrentValue(initialValue);
          setChecklistItems([]);
          setMealInputs([]);
          break;
        case 'checklist':
          setChecklistItems(task.checklist || []);
          setCurrentValue(0);
          setMealInputs([]);
          break;
        case 'meals':
          setMealInputs(task.meals || []);
          setCurrentValue(0);
          setChecklistItems([]);
          break;
        default:
          setCurrentValue(0);
          setChecklistItems([]);
          setMealInputs([]);
          break;
      }

      // Start open animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(blurAnim, {
          toValue: 60,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false, 
        }),
      ]).start();
    } else if (!isVisible) {
      // Start close animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 500,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blurAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isVisible, task]);

  const handleClose = (saveData = null) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(blurAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => onClose(saveData));
  };
  
  const renderSimpleTask = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.taskTitle}>{task.task}</Text>
    </View>
  );

  const renderSleepTask = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.taskTitle}>How much did you sleep?</Text>
      <SleepSlider 
        min={0}
        max={12}
        initialValue={currentValue}
        onValueChange={setCurrentValue}
      />
    </View>
  );

  const renderChecklistTask = () => {
    const toggleItem = (itemId) => {
      setChecklistItems(
        checklistItems.map(item =>
          item.id === itemId ? { ...item, done: !item.done } : item
        )
      );
    };

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.taskTitle}>Which supplements did you take?</Text>
        <View style={styles.checklistContainer}>
          {checklistItems.map(item => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={toggleItem}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderMealsTask = () => {
    const handleTextChange = (text, mealId) => {
      setMealInputs(
        mealInputs.map(meal =>
          meal.id === mealId ? { ...meal, food: text } : meal
        )
      );
    };

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.taskTitle}>What did you eat today?</Text>
        <View style={styles.mealsContainer}>
          {mealInputs.map(meal => (
            <View key={meal.id} style={styles.mealInputContainer}>
              <Text style={styles.mealLabel}>{meal.name}</Text>
              <TextInput
                style={styles.mealTextInput}
                placeholder="e.g., Chicken breast, quinoa..."
                placeholderTextColor="#555"
                value={meal.food}
                onChangeText={(text) => handleTextChange(text, meal.id)}
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderContent = () => {
    switch (task.type) {
      case 'sleep':
        return renderSleepTask();
      case 'checklist':
        return renderChecklistTask();
      case 'meals':
        return renderMealsTask();
      default:
        return renderSimpleTask();
    }
  };

  if (!task) return null;

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => handleClose()}
    >
      <TouchableWithoutFeedback onPress={() => handleClose()}>
        <AnimatedBlurView intensity={blurAnim} tint="dark" style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }], height: getModalHeight() }]}>
              <LinearGradient colors={['#181818', '#0A0A0A']} style={styles.gradientContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={() => handleClose()}>
                  <Ionicons name="close-circle" size={30} color="#555555" />
                </TouchableOpacity>
                
                {renderContent()}
                
                <TouchableOpacity style={styles.saveButton} onPress={() => {
                  let saveData = { id: task.id };
                  if (task.type === 'simple') {
                    saveData.progress = 100;
                  } else if (task.type === 'sleep') {
                    saveData.progress = Math.min(Math.round((currentValue / task.goal) * 100), 100);
                  } else if (task.type === 'checklist') {
                    const doneCount = checklistItems.filter(item => item.done).length;
                    saveData.progress = Math.round((doneCount / checklistItems.length) * 100);
                    saveData.checklist = checklistItems;
                  } else if (task.type === 'meals') {
                    const doneCount = mealInputs.filter(m => m.food.trim() !== '').length;
                    saveData.progress = Math.round((doneCount / mealInputs.length) * 100);
                    saveData.meals = mealInputs;
                  }
                  handleClose(saveData);
                }}>
                  <Text style={styles.saveButtonText}>
                    {task.type === 'simple' ? 'Mark as Complete' : 'Save Progress'}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </TouchableWithoutFeedback>
        </AnimatedBlurView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  gradientContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  closeButton: {
    alignSelf: 'flex-end',
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  taskTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  mealsContainer: {
    width: '100%',
  },
  mealInputContainer: {
    marginBottom: 20,
  },
  mealLabel: {
    color: '#888888',
    fontSize: 16,
    marginBottom: 8,
  },
  mealTextInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#FFFFFF',
    fontSize: 18,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  checklistContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  checkboxContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  checklistText: {
    fontSize: 20,
    fontWeight: '600',
  },
  strikethrough: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#FFFFFF',
    top: '50%',
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TaskDetailModal;
