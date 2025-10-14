import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const formatValue = (value, unit) => {
  if (unit === 'minutes') {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
  return `${value} ${unit}`;
};

const CustomSlider = ({ min, max, initialValue, onValueChange, unit, step = 1 }) => {
  const [localValue, setLocalValue] = useState(initialValue);
  const lastHapticValue = useRef(initialValue);
  const isSliding = useRef(false);
  
  // Animation values
  const trackWidthAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowLoopRef = useRef(null);

  // Initialize and animate on mount AND on every re-render
  useEffect(() => {
    const clamp = (n, minV, maxV) => Math.max(minV, Math.min(maxV, n));
    const initialPercent = clamp(((initialValue - min) / (max - min)) * 100, 0, 100);
    
    // Set initial values
    trackWidthAnim.setValue(initialPercent);
    
    // Reset glow animation to starting position
    glowAnim.setValue(0);
    
    // Stop existing loop if any
    if (glowLoopRef.current) {
      glowLoopRef.current.stop();
    }

    // Start continuous glow animation
    glowLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );
    
    glowLoopRef.current.start();
    
    // Cleanup: stop animation when component unmounts or re-renders
    return () => {
      if (glowLoopRef.current) glowLoopRef.current.stop();
    };
  }, [min, max, initialValue]); // Re-run when these values change

  useEffect(() => {
    if (!isSliding.current) {
      const clamp = (n, minV, maxV) => Math.max(minV, Math.min(maxV, n));
      setLocalValue(initialValue);
      const percent = clamp(((initialValue - min) / (max - min)) * 100, 0, 100);
      Animated.spring(trackWidthAnim, {
        toValue: percent,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [initialValue, min, max]);

  const handleValueChange = (value) => {
    const clamp = (n, minV, maxV) => Math.max(minV, Math.min(maxV, n));
    const roundedValue = Math.round(value / step) * step;
    setLocalValue(roundedValue);

    const percent = clamp(((roundedValue - min) / (max - min)) * 100, 0, 100);
    
    Animated.parallel([
      Animated.spring(trackWidthAnim, {
        toValue: percent,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }),
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
    
    if (roundedValue !== lastHapticValue.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lastHapticValue.current = roundedValue;
    }
  };

  const handleSlidingStart = () => {
    isSliding.current = true;
    // Restart glow loop on touch to ensure visibility
    if (glowLoopRef.current) glowLoopRef.current.stop();
    glowAnim.setValue(0);
    glowLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    );
    glowLoopRef.current.start();
  };

  const handleSlidingComplete = (value) => {
    isSliding.current = false;
    const roundedValue = Math.round(value / step) * step;
    onValueChange(roundedValue);
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const glowTranslate = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.currentValueText, { transform: [{ scale: pulseAnim }] }]}>
        {formatValue(localValue, unit)}
      </Animated.Text>
      
      <View style={styles.sliderContainer}>
        {/* Dark background track */}
        <View style={styles.trackBackground} />
        
        {/* Animated fill with liquid glass effect */}
        <Animated.View 
          style={[
            styles.trackFillContainer,
            { width: trackWidthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%']
            })}
          ]}
        >
          {/* Base gradient layer */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.15)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.trackFillBase}
          />
          
          {/* Animated glow layer */}
          <Animated.View 
            style={[
              styles.glowContainer,
              {
                opacity: glowOpacity,
                transform: [{ translateX: glowTranslate }]
              }
            ]}
          >
            <LinearGradient
              colors={['transparent', 'rgba(255, 255, 255, 0.8)', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.glowGradient}
            />
          </Animated.View>
          
          {/* Top shine layer */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.4)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.5 }}
            style={styles.shineLayer}
          />
        </Animated.View>
        
        {/* Native slider for interaction */}
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={localValue}
          onValueChange={handleValueChange}
          onSlidingStart={handleSlidingStart}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor="#FFFFFF" 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  currentValueText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  sliderContainer: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
  },
  trackBackground: {
    width: '100%',
    height: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  trackFillContainer: {
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    overflow: 'hidden',
  },
  trackFillBase: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  glowContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  glowGradient: {
    width: 100,
    height: '100%',
  },
  shineLayer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  slider: {
    width: '100%',
    height: '100%',
  },
});

export default CustomSlider;
