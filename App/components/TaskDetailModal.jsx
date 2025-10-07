import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Easing, TouchableWithoutFeedback, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import CustomSlider from './CustomSlider';
import { OPENAI_API_KEY } from '@env';
import OpenAI from 'openai';  
import { useRouter } from 'expo-router';



const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
console.log(OPENAI_API_KEY);

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
  const router = useRouter();
  const [currentValue, setCurrentValue] = useState(0);
  const [checklistItems, setChecklistItems] = useState([]);
  const [mealInput, setMealInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showMealHistory, setShowMealHistory] = useState(false);
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
    const handleAnalyze = async () => {
      setIsAnalyzing(true);
      setAnalysis(null);
      Keyboard.dismiss();

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a testosterone optimization assistant. Analyze the user's meal for its impact on testosterone production. Provide a response in JSON format with two keys: "score" (a number from 0 to 100 representing how good this meal is for testosterone optimization) and "text" (a brief, one-sentence analysis explaining why this meal is good or bad for testosterone).`
            },
            {
              role: 'user',
              content: mealInput
            }
          ],
        });

        const result = JSON.parse(completion.choices[0].message.content);
        setAnalysis({ text: result.text, score: result.score });

      } catch (error) {
        console.error("OpenAI API Error:", error);
        setAnalysis({
          text: 'Sorry, the analysis could not be completed at this time.',
          score: 0,
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1, width: '100%' }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.contentContainer}>
            <Text style={styles.taskTitle}>What did you eat today?</Text>
            
            {task.history && task.history.length > 0 && (
              <TouchableOpacity 
                style={styles.viewHistoryButton} 
                onPress={() => setShowMealHistory(true)}
              >
                <Ionicons name="list-outline" size={20} color="#FFFFFF" />
                <Text style={styles.viewHistoryButtonText}>View History ({task.history.length} meals)</Text>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            )}

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
                <View style={[styles.analysisResult, analysis.score < 50 && styles.badAnalysisResult]}>
                  <Text style={styles.analysisText}>{analysis.text}</Text>
                  <Text style={[styles.analysisScore, analysis.score < 50 && styles.badAnalysisScore]}>{analysis.score}%</Text>
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
                      : Math.round((currentValue / task.goal) * 100);
                  } else if (task.type === 'checklist') {
                    const doneCount = checklistItems.filter(item => item.done).length;
                    saveData.progress = Math.round((doneCount / checklistItems.length) * 100);
                    saveData.checked = checklistItems.filter(item => item.done).map(item => item.id);
                  } else if (task.type === 'meals') {
                    if (analysis) {
                      // For meals, if score is below 50%, make it negative progress
                      saveData.progress = analysis.score < 50 ? -(100 - analysis.score) : analysis.score;
                    } else {
                      saveData.progress = task.progress || 0;
                    }
                    saveData.description = mealInput;
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
      
      {/* Meal History Modal */}
      {showMealHistory && task.history && (
        <MealHistoryModal 
          visible={showMealHistory}
          meals={task.history}
          onClose={() => setShowMealHistory(false)}
        />
      )}
    </Modal>
  );
};

const MealHistoryModal = ({ visible, meals, onClose }) => {
  const totalScore = meals.reduce((sum, meal) => sum + meal.value, 0);
  const averageScore = meals.length > 0 ? Math.round(totalScore / meals.length) : 0;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.historyModalContainer}>
        <TouchableOpacity 
          style={styles.historyBackdrop} 
          activeOpacity={1}
          onPress={onClose}
        />
        <LinearGradient colors={['#0A0A0A', '#000000']} style={styles.historyContent}>
          <SafeAreaView style={styles.historySafeArea} edges={['top']}>
            <View style={styles.historyHeader}>
              <View style={styles.historyHeaderTop}>
                <Text style={styles.historyTitle}>Meal History</Text>
                <TouchableOpacity onPress={onClose} style={styles.historyCloseButton}>
                  <Ionicons name="close-circle" size={32} color="#555" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.historyStatsContainer}>
                <View style={styles.historyStatBox}>
                  <Text style={styles.historyStatValue}>{meals.length}</Text>
                  <Text style={styles.historyStatLabel}>Meals Today</Text>
                </View>
                <View style={styles.historyStatDivider} />
                <View style={styles.historyStatBox}>
                  <Text style={[styles.historyStatValue, averageScore < 0 ? styles.historyStatValueNegative : styles.historyStatValuePositive]}>
                    {averageScore > 0 ? '+' : ''}{averageScore}%
                  </Text>
                  <Text style={styles.historyStatLabel}>Avg. Score</Text>
                </View>
              </View>
            </View>
            
            <ScrollView contentContainerStyle={styles.historyScrollContent} showsVerticalScrollIndicator={false}>
              {meals.map((item, index) => (
                <View key={index} style={styles.historyMealCard}>
                  <View style={styles.historyMealTop}>
                    <View style={styles.historyMealLeft}>
                      <View style={[styles.historyMealDot, item.value < 0 && styles.historyMealDotNegative]} />
                      <View style={styles.historyMealInfo}>
                        <Text style={styles.historyMealLabel}>Meal {index + 1}</Text>
                        <Text style={styles.historyMealTime}>
                          {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.historyScoreBadge, item.value < 0 && styles.historyScoreBadgeNegative]}>
                      <Text style={[styles.historyScoreText, item.value < 0 && styles.historyScoreTextNegative]}>
                        {item.value > 0 ? `+${item.value}` : item.value}%
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.historyMealDescription}>{item.description || `Meal ${index + 1}`}</Text>
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </View>
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
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  viewHistoryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
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
  badAnalysisResult: {
    borderColor: 'rgba(255, 107, 107, 0.4)',
  },
  badAnalysisScore: {
    color: '#FF6B6B',
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
  // Meal History Modal Styles
  historyModalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  historyBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  historyContent: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  historySafeArea: {
    flex: 1,
  },
  historyHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  historyTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  historyCloseButton: {
    marginLeft: 16,
  },
  historyStatsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  historyStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  historyStatValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historyStatValuePositive: {
    color: '#FFFFFF',
  },
  historyStatValueNegative: {
    color: '#FF6B6B',
  },
  historyStatLabel: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  historyStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
  },
  historyScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  historyMealCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  historyMealTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  historyMealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyMealDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  historyMealDotNegative: {
    backgroundColor: '#FF6B6B',
  },
  historyMealInfo: {
    flex: 1,
  },
  historyMealLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  historyMealTime: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  historyScoreBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: 12,
  },
  historyScoreBadgeNegative: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  historyScoreText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  historyScoreTextNegative: {
    color: '#FF6B6B',
  },
  historyMealDescription: {
    color: '#CCCCCC',
    fontSize: 15,
    lineHeight: 22,
  },
});

export default TaskDetailModal;
