import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path, Text as SvgText, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const graphWidth = width - 40;
const graphHeight = 250;

const JourneyGraph = () => {
  const router = useRouter();

  return (
    <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>The Two Paths to Boosting Testosterone</Text>
        <Text style={styles.description}>
          See the difference between a structured plan and conventional trial-and-error methods.
        </Text>

        <View style={styles.graphContainer}>
          <Svg width={graphWidth} height={graphHeight}>
            {/* Red Volatile Path */}
            <Path
              d={`M 20 180 Q 60 140, 100 160 T 180 150 Q 220 80, 260 140 T 340 180`}
              stroke="url(#redGradient)"
              strokeWidth="4"
              fill="url(#redFillGradient)"
            />
            <Defs>
              <SvgLinearGradient id="redGradient" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#E53935" stopOpacity="1" />
                <Stop offset="1" stopColor="#D90429" stopOpacity="1" />
              </SvgLinearGradient>
              <SvgLinearGradient id="redFillGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#D90429" stopOpacity="0.4" />
                <Stop offset="1" stopColor="#101010" stopOpacity="0.1" />
              </SvgLinearGradient>
            </Defs>

            {/* Green Steady Path */}
            <Path
              d={`M 20 160 Q 100 100, 200 80 T 340 40`}
              stroke="#8AC926"
              strokeWidth="4"
              fill="none"
            />
            
            {/* Start & End Points */}
            <Circle cx="20" cy="180" r="6" fill="#FFFFFF" />
            <Circle cx="20" cy="160" r="6" fill="#FFFFFF" />
            <Circle cx="340" cy="40" r="6" fill="#8AC926" />

            {/* Relapse 'X' Marks */}
            <SvgText x="120" y="145" fill="#E53935" fontSize="16" fontWeight="bold">X</SvgText>
            <SvgText x="210" y="115" fill="#E53935" fontSize="16" fontWeight="bold">X</SvgText>
            <SvgText x="280" y="130" fill="#E53935" fontSize="16" fontWeight="bold">X</SvgText>

            {/* Labels */}
            <SvgText x="240" y="170" fill="#E53935" fontSize="12" fontWeight="bold">Conventional Methods</SvgText>
            <SvgText x="280" y="70" fill="#8AC926" fontSize="12" fontWeight="bold">Our Program</SvgText>
            
            {/* Axis Labels */}
            <SvgText x="30" y={graphHeight - 5} fill="#8A95B6" fontSize="12">Week 1</SvgText>
            <SvgText x={graphWidth / 2 - 20} y={graphHeight - 5} fill="#8A95B6" fontSize="12">Week 6</SvgText>
            <SvgText x={graphWidth - 60} y={graphHeight - 5} fill="#8A95B6" fontSize="12">Week 12</SvgText>
          </Svg>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={() => router.push('/onboarding/benefitsGraph')}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
        
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#8A95B6',
    textAlign: 'center',
    marginBottom: 40,
  },
  graphContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
  },
});

export default JourneyGraph;
