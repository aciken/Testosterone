import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Line, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

const TestosteroneGauge = ({ value, size = 300, strokeWidth = 3 }) => {
  const center = size / 2;
  const radius = center - 20;
  
  const minLevel = 250;
  const maxLevel = 1100;
  const goalLevel = 900;
  
  const progress = Math.min(Math.max(value, minLevel), maxLevel);
  const percentage = (progress - minLevel) / (goalLevel - minLevel);

  const startAngle = -120;
  const endAngle = 120;
  const totalAngle = endAngle - startAngle;

  const polarToCartesian = (angle, r) => {
    const a = (angle - 90) * Math.PI / 180.0;
    const x = center + r * Math.cos(a);
    const y = center + r * Math.sin(a);
    return { x, y };
  };

  const inRange = value >= 300 && value <= 900;
  const numTicks = 80;

  const renderTicks = () => {
    const ticks = [];
    for (let i = 0; i <= numTicks; i++) {
      const tickAngle = startAngle + (i / numTicks) * totalAngle;
      const startPoint = polarToCartesian(tickAngle, radius - 8);
      const endPoint = polarToCartesian(tickAngle, radius + 8);
      const isFilled = i / numTicks <= percentage;
      
      ticks.push(
        <Line
          key={i}
          x1={startPoint.x}
          y1={startPoint.y}
          x2={endPoint.x}
          y2={endPoint.y}
          stroke={isFilled ? 'url(#grad)' : '#333333'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      );
    }
    return ticks;
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size * 0.7}>
        <Defs>
          <SvgLinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#AECBFA" stopOpacity="1" />
            <Stop offset="1" stopColor="#4A90E2" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        <G transform="translate(0, -15)">{renderTicks()}</G>
      </Svg>
      <View style={styles.textContainer}>
        <MaskedView
          style={styles.maskedView}
          maskElement={<Text style={styles.valueText}>{value}</Text>}
        >
          <LinearGradient
            colors={['#FFFFFF', '#B3B8C8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
          />
        </MaskedView>
        <Text style={styles.unitText}>ng/dl</Text>
        <Text style={styles.scoreLabel}>TESTOSTERONE SCORE</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  maskedView: {
    height: 80,
    width: 200,
  },
  valueText: {
    fontSize: 80,
    fontWeight: 'bold', // Using a standard weight for reliability
    color: 'black',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  unitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 0,
  },
  scoreLabel: {
    color: '#8A95B6',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 8,
  },
});

export default TestosteroneGauge;
