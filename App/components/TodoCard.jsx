import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const TodoCard = ({ todo, onPress, isEditable }) => {
  const isCompleted = todo.progress === 100;
  const animation = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;
  const progressAnim = useRef(new Animated.Value(todo.progress || 0)).current;

  const getGoalText = () => {
    switch (todo.type) {
      case 'slider':
        return todo.inverted ? `Goal: < ${todo.maxValue / 2} ${todo.unit}` : `Goal: ${todo.goal} ${todo.unit}`;
      case 'checklist':
        return `Goal: ${todo.checklist.length} items`;
      case 'meals':
        return `Goal: ${todo.meals.length} meals`;
      case 'simple':
        return 'Goal: Complete';
      default:
        return '';
    }
  };

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isCompleted ? 1 : 0,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [isCompleted]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: todo.progress || 0,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [todo.progress]);

  const animatedCardStyle = {
    borderWidth: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2],
    }),
    borderColor: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(255, 255, 255, 0.2)', todo.inverted ? 'rgba(255, 107, 107, 0.9)' : 'rgba(255, 255, 255, 0.9)'],
    }),
  };

  const animatedTitleStyle = {
    opacity: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.6],
    }),
  };

  const doneOpacity = animation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const blurOpacity = animation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const animatedProgressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <AnimatedTouchableOpacity
      style={[styles.todoCard, animatedCardStyle, !isEditable && styles.disabledCard]}
      onPress={isEditable ? onPress : null}
      activeOpacity={isEditable ? 0.7 : 1}
    >
      <ImageBackground source={todo.image} style={styles.imageBackground} imageStyle={styles.imageStyle}>
        <Animated.View style={{...StyleSheet.absoluteFillObject, opacity: blurOpacity }}>
          {isCompleted && <BlurView intensity={30} tint={todo.inverted ? "dark" : "light"} style={StyleSheet.absoluteFill} />}
        </Animated.View>
        <LinearGradient
          colors={isCompleted ? (todo.inverted ? ['rgba(150,0,0,0.5)', 'rgba(50,0,0,0.5)'] : ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.5)']) : ['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
          style={styles.gradient}
        >
          <View style={{ height: 28 }}>
            <Animated.View style={{ opacity: doneOpacity, position: 'absolute' }}>
              <View style={[styles.badgeContainer, isCompleted && todo.inverted ? styles.failedBadge : styles.completedBadge]}>
                <Ionicons name={isCompleted && todo.inverted ? "warning-outline" : "checkmark-sharp"} size={16} color="#FFFFFF" />
                <Text style={styles.completedText}>{isCompleted && todo.inverted ? "FAILED" : "DONE"}</Text>
              </View>
            </Animated.View>
          </View>

          <View style={styles.cardContent}>
            <Animated.Text style={[styles.todoTitle, animatedTitleStyle]}>{todo.task}</Animated.Text>
            <View style={styles.bottomContainer}>
              <View style={styles.cardProgressContainer}>
                <View style={styles.cardProgressBarBackground}>
                  <Animated.View style={[styles.cardProgressBarFill, { width: animatedProgressWidth }]} />
                </View>
              </View>
              <Text style={styles.goalText}>{getGoalText()}</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  todoCard: {
    height: 160,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  disabledCard: {
    opacity: 0.6,
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
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  completedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
  },
  failedBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
    paddingHorizontal: 10,
  },
  completedText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 12,
    letterSpacing: 1,
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
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  cardProgressContainer: {
    flex: 1,
    height: 6,
    marginRight: 12,
  },
  cardProgressBarBackground: {
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  cardProgressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  goalText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default TodoCard;
