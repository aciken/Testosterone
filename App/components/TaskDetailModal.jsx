import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Easing, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import SleepSlider from './SleepSlider';

const TaskDetailModal = ({ isVisible, task, onClose, onSave }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const slideAnim = useRef(new Animated.Value(500)).current;
  const blurAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      if (task) {
        const initialValue = (task.progress / 100) * (task.goal || 1);
        setCurrentValue(initialValue);
      }
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
    } else {
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
  }, [isVisible]);

  const handleClose = () => {
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
    ]).start(() => onClose());
  };

  const handleSave = () => {
    const newProgress = task.type === 'simple' ? 100 : Math.min(Math.round((currentValue / task.goal) * 100), 100);
    onSave(task.id, newProgress);
    handleClose();
  };
  
  const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

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

  if (!task) return null;

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <AnimatedBlurView intensity={blurAnim} tint="dark" style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
              <LinearGradient colors={['#181818', '#0A0A0A']} style={styles.gradientContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <Ionicons name="close-circle" size={30} color="#555555" />
                </TouchableOpacity>
                
                {task.type === 'sleep' ? renderSleepTask() : renderSimpleTask()}
                
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>{task.type === 'simple' ? 'Mark as Complete' : 'Save Progress'}</Text>
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
    height: '55%',
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
