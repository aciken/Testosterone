import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path, Text as SvgText, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, G, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const graphWidth = width - 40;
const graphHeight = 250;

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);

const JourneyGraph = () => {
  const router = useRouter();

  const greenPathLength = 400; 
  const redPathLength = 450;

  const greenPathAnim = useRef(new Animated.Value(greenPathLength)).current;
  const redPathAnim = useRef(new Animated.Value(redPathLength)).current;
  
  const x1Anim = useRef(new Animated.Value(0)).current;
  const x2Anim = useRef(new Animated.Value(0)).current;
  const x3Anim = useRef(new Animated.Value(0)).current;
  const greenDotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const drawAnimation = Animated.parallel([
      Animated.timing(greenPathAnim, {
        toValue: 0,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(redPathAnim, {
        toValue: 0,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]);

    const fadeInAnimation = Animated.sequence([
      Animated.delay(1500),
      Animated.timing(x1Anim, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.timing(x2Anim, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.timing(x3Anim, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.timing(greenDotAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
    ]);
    
    Animated.sequence([
      drawAnimation,
      fadeInAnimation,
      Animated.delay(500)
    ]).start();
  }, []);

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
            <AnimatedPath
              d={`M 20 180 Q 60 140, 100 160 T 180 150 Q 220 80, 260 140 T 340 180`}
              stroke="url(#redGradient)"
              strokeWidth="3"
              fill="url(#redFillGradient)"
              strokeDasharray={redPathLength}
              strokeDashoffset={redPathAnim}
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
              <SvgLinearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#ADFF2F" />
                <Stop offset="1" stopColor="#8AC926" />
              </SvgLinearGradient>
              <SvgLinearGradient id="greenFillGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#8AC926" stopOpacity="0.3" />
                <Stop offset="1" stopColor="#101010" stopOpacity="0.1" />
              </SvgLinearGradient>
            </Defs>

            {/* Green Steady Path */}
             <AnimatedPath
              d={`M 20 160 Q 100 100, 200 80 T 340 40`}
              stroke="url(#greenGradient)"
              strokeWidth="3"
              fill="none"
              strokeDasharray={greenPathLength}
              strokeDashoffset={greenPathAnim}
            />
            
            {/* Start & End Points */}
            <Circle cx="20" cy="180" r="6" fill="#FFFFFF" />
            <Circle cx="20" cy="160" r="6" fill="#FFFFFF" />
            <AnimatedCircle cx="340" cy="40" r="6" fill="#8AC926" opacity={greenDotAnim} />

            {/* Labels */}
            <G x="220" y="165">
                <Rect x="-10" y="-15" width="140" height="24" rx="12" fill="rgba(217, 4, 41, 0.3)" />
                <SvgText fill="#FFFFFF" fontSize="12" fontWeight="bold">Conventional Methods</SvgText>
            </G>

            <G x="250" y="25">
                <Rect x="-10" y="-15" width="100" height="24" rx="12" fill="rgba(138, 201, 38, 0.3)" />
                <SvgText fill="#FFFFFF" fontSize="12" fontWeight="bold">Our Program</SvgText>
            </G>
            
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
