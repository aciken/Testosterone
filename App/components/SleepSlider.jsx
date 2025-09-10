import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

const SleepSlider = ({ min, max, initialValue, onValueChange }) => {
  const lastHapticValue = useRef(initialValue);

  const handleValueChange = (value) => {
    const roundedValue = Math.round(value);
    onValueChange(roundedValue);
    
    if (roundedValue !== lastHapticValue.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lastHapticValue.current = roundedValue;
    }
  };

  const ticks = Array.from({ length: (max - min) + 1 }, (_, i) => i);

  return (
    <View style={styles.container}>
      <Text style={styles.currentValueText}>{initialValue} hours</Text>
      <View style={styles.sliderContainer}>
        <View style={styles.ticksContainer}>
          {ticks.map(tick => (
            <View 
              key={tick} 
              style={[
                styles.tick,
                tick % 2 === 0 ? styles.largeTick : styles.smallTick,
              ]} 
            />
          ))}
        </View>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={1}
          value={initialValue}
          onValueChange={handleValueChange}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#2C2C2E"
          thumbTintColor="transparent" 
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
    marginBottom: 20,
  },
  sliderContainer: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  ticksContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  tick: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 2,
    borderRadius: 1,
  },
  largeTick: {
    height: 20,
  },
  smallTick: {
    height: 10,
  },
});

export default SleepSlider;
