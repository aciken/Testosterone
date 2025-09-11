import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Easing, TouchableWithoutFeedback, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import CustomSlider from './CustomSlider';

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
  const [mealInput, setMealInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const slideAnim = useRef(new Animated.Value(500)).current;
  const blurAnim = useRef(new Animated.Value(0)).current;

  const getModalHeight = () => {
    if (!task) return '55%';
    switch (task.type) {
      case 'meals':
        return '65%';
      case 'checklist':
        return '65%';
      case 'sleep':
        return '55%';
      case 'simple_dont':
      case 'simple':
        return '35%';
      default:
        return '55%';
    }
  };

  useEffect(() => {
    if (isVisible && task) {
      // Reset state based on task type
      switch (task.type) {
        case 'slider':
          const initialValue = task.inverted
            ? (task.progress / 100) * (task.maxValue || 10)
            : (task.progress / 100) * (task.goal || 1);
          setCurrentValue(initialValue);
          setChecklistItems([]);
          setMealInput('');
          setIsAnalyzing(false);
          setAnalysis(null);
          break;
        case 'checklist':
          // If the task object already has a 'checked' property, use it to initialize the state
          const initialChecklist = (task.checklist || []).map(item => ({
            ...item,
            done: task.checked ? task.checked.includes(item.id) : false,
          }));
          setChecklistItems(initialChecklist);
          setCurrentValue(0);
          setMealInput('');
          setIsAnalyzing(false);
          setAnalysis(null);
          break;
        case 'meals':
          setMealInput('');
          setIsAnalyzing(false);
          setAnalysis(null);
          setCurrentValue(0);
          setChecklistItems([]);
          break;
        default:
          setCurrentValue(0);
          setChecklistItems([]);
          setMealInput('');
          setIsAnalyzing(false);
          setAnalysis(null);
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
      <Ionicons name="barbell-outline" size={48} color="#8A95B6" style={{ marginBottom: 16 }}/>
      <Text style={styles.taskTitle}>
        {task.task === 'High-intensity workout'
          ? 'Did you do an intensive weightlifting workout today?'
          : task.task}
      </Text>
    </View>
  );

  const renderSimpleDontTask = () => (
    <View style={styles.contentContainer}>
      <Ionicons name="shield-checkmark-outline" size={48} color="#8A95B6" style={{ marginBottom: 16 }}/>
      <Text style={styles.taskTitle}>Did you successfully {task.task.toLowerCase()}?</Text>
    </View>
  );

  const renderSliderTask = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.taskTitle}>
        {task.inverted ? `Rate your ${task.task.toLowerCase()}` : `How much ${task.task.toLowerCase()}?`}
      </Text>
      <CustomSlider 
        min={0}
        max={task.maxValue || task.goal * 1.5}
        initialValue={currentValue}
        onValueChange={setCurrentValue}
        unit={task.unit}
        step={task.step || 1}
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
    const handleAnalyze = () => {
      setIsAnalyzing(true);
      setAnalysis(null);
      setTimeout(() => {
        const score = Math.floor(Math.random() * 11) + 90; // 90-100
        setAnalysis({
          text: 'Excellent choice! Rich in protein and micronutrients to support hormone health.',
          score: score,
        });
        setIsAnalyzing(false);
      }, 1500);
    };

    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1, width: '100%' }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.contentContainer}>
            <Text style={styles.taskTitle}>What did you eat today?</Text>
            <TextInput
              style={styles.mealTextInput}
              placeholder="e.g., Steak, eggs, and spinach..."
              placeholderTextColor="#555"
              value={mealInput}
              onChangeText={setMealInput}
              multiline
            />
            <View style={styles.analysisContainer}>
              {isAnalyzing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : analysis ? (
                <View style={styles.analysisResult}>
                  <Text style={styles.analysisText}>{analysis.text}</Text>
                  <Text style={styles.analysisScore}>{analysis.score}%</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.analyzeButton, !mealInput && styles.disabledButton]}
                  onPress={handleAnalyze}
                  disabled={!mealInput}
                >
                  <Text style={styles.analyzeButtonText}>Analyze Meal</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  };

  const renderContent = () => {
    switch (task.type) {
      case 'slider':
        return renderSliderTask();
      case 'checklist':
        return renderChecklistTask();
      case 'meals':
        return renderMealsTask();
      case 'simple_dont':
        return renderSimpleDontTask();
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
                  if (task.type === 'simple' || task.type === 'simple_dont') {
                    saveData.progress = 100;
                  } else if (task.type === 'slider') {
                    saveData.progress = task.inverted
                      ? Math.min(Math.round((currentValue / (task.maxValue / 2)) * 100), 100)
                      : Math.min(Math.round((currentValue / task.goal) * 100), 100);
                  } else if (task.type === 'checklist') {
                    const doneCount = checklistItems.filter(item => item.done).length;
                    saveData.progress = Math.round((doneCount / checklistItems.length) * 100);
                    saveData.checked = checklistItems.filter(item => item.done).map(item => item.id);
                  } else if (task.type === 'meals') {
                    saveData.progress = analysis ? analysis.score : task.progress || 0;
                    saveData.meals = [{ id: 'm1', food: mealInput }];
                  }
                  handleClose(saveData);
                }}>
                  <Text style={styles.saveButtonText}>
                    {task.type === 'simple' || task.type === 'simple_dont' ? 'Mark as Complete' : 'Save Progress'}
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
    paddingHorizontal: 25,
    paddingBottom: 20, // Pushes content up from the save button
  },
  taskTitle: {
    color: '#E0E0E0',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
  },
  mealTextInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#FFFFFF',
    fontSize: 18,
    padding: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 120,
    textAlignVertical: 'top',
    width: '100%',
  },
  analysisContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  analyzeButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 30,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  analysisResult: {
    alignItems: 'center',
    padding: 16,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  analysisText: {
    color: '#E0E0E0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  analysisScore: {
    color: '#4CAF50',
    fontSize: 22,
    fontWeight: 'bold',
  },
  checklistContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    width: '100%',
  },
  checkboxContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  checklistText: {
    fontSize: 19,
    fontWeight: '600',
  },
  strikethrough: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#FFFFFF',
    top: '50%',
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  saveButtonText: {
    color: '#0A0A0A',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TaskDetailModal;
