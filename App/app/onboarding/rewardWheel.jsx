import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Modal, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Path, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const SECTORS = [
  { label: '10%', sub: 'OFF', color: '#2A2A2A', textColor: '#AAA', angle: 66 },
  { label: 'TRY', sub: 'AGAIN', color: '#1A1A1A', textColor: '#666', angle: 66 },
  { label: '50%', sub: 'OFF', color: '#FF9500', textColor: '#000', isWinner: true, angle: 30 }, // Smallest slice
  { label: 'FREE', sub: 'TRIAL', color: '#2A2A2A', textColor: '#AAA', angle: 66 },
  { label: '20%', sub: 'OFF', color: '#1A1A1A', textColor: '#AAA', angle: 66 },
  { label: 'TRY', sub: 'AGAIN', color: '#2A2A2A', textColor: '#666', angle: 66 },
];

const CONFETTI_COLORS = ['#FFD700', '#FFA500', '#FF4500', '#FFFFFF', '#4ECDC4'];
const PARTICLE_COUNT = 40;

const ConfettiParticle = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [config] = useState(() => ({
    x: Math.random() * 400 - 200,
    delay: Math.random() * 1000,
    duration: 2500 + Math.random() * 1000,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 4,
    rotation: Math.random() * 360,
  }));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: config.duration,
          delay: config.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, { toValue: 0, duration: 0, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 800]
  });

  const rotateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const rotateZ = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [`${config.rotation}deg`, `${config.rotation + 360}deg`]
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -50,
        left: '50%',
        width: config.size,
        height: config.size,
        backgroundColor: config.color,
        borderRadius: config.size > 8 ? 2 : 4, // Mix of squares and circles
        transform: [
          { translateX: config.x },
          { translateY },
          { rotateX },
          { rotate: rotateZ }
        ],
        opacity: animatedValue.interpolate({
            inputRange: [0, 0.8, 1],
            outputRange: [1, 1, 0]
        })
      }}
    />
  );
};

const Confetti = () => (
  <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]} pointerEvents="none">
    {[...Array(PARTICLE_COUNT)].map((_, i) => <ConfettiParticle key={i} />)}
  </View>
);

const Wheel = ({ onFinished, onTryAgain }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);
  const [spinning, setSpinning] = useState(false);

  const getSectorData = (index) => {
    let startAngle = 0;
    for (let i = 0; i < index; i++) startAngle += SECTORS[i].angle;
    const centerAngle = startAngle + SECTORS[index].angle / 2;
    return { startAngle, centerAngle, angle: SECTORS[index].angle };
  };

  const handleSpinPress = () => {
    if (spinning) return;
    setSpinning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // 50/50 Chance
    const isWinner = Math.random() >= 0.5;
    let targetIndex;
    
    if (isWinner) {
      targetIndex = 2; // 50% OFF
    } else {
      // Pick randomly between the two "TRY AGAIN" slices (Index 1 or 5)
      targetIndex = Math.random() > 0.5 ? 1 : 5;
    }

    const { centerAngle, angle: sectorWidth } = getSectorData(targetIndex);
    
    // We want the sector center to land at 270 degrees (Top)
    let targetVisualAngle = (270 - centerAngle); 
    if(targetVisualAngle < 0) targetVisualAngle += 360;

    const currentRot = currentRotation.current;
    const currentVisualAngle = currentRot % 360;

    let delta = targetVisualAngle - currentVisualAngle;
    if (delta < 0) delta += 360;

    const totalSpin = 1800 + delta;
    const randomOffset = (Math.random() * sectorWidth * 0.4) * (Math.random() > 0.5 ? 1 : -1);
    const finalValue = currentRot + totalSpin + randomOffset;

    Animated.timing(spinValue, {
      toValue: finalValue,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
        currentRotation.current = finalValue;
        setSpinning(false);
        
        if (isWinner) {
             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
             setTimeout(onFinished, 500);
        } else {
             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
             setTimeout(onTryAgain, 500);
        }
    });
  };

  const spin = spinValue.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.wheelContainer}>
      <View style={styles.stopperContainer}>
        <Ionicons name="caret-down" size={50} color="#FFF" style={styles.stopper} />
      </View>

      <View style={styles.wheelBorder}>
        <Animated.View style={[styles.wheel, { transform: [{ rotate: spin }] }]}>
          <Svg height="300" width="300" viewBox="0 0 100 100">
            <Defs>
                <SvgGradient id="winnerGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#FFD700" />
                    <Stop offset="1" stopColor="#FF9500" />
                </SvgGradient>
            </Defs>
            {SECTORS.map((sector, index) => {
              let startAngle = 0;
              for(let i=0; i<index; i++) startAngle += SECTORS[i].angle;
              const endAngle = startAngle + sector.angle;
              
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              const x1 = 50 + 50 * Math.cos(startRad);
              const y1 = 50 + 50 * Math.sin(startRad);
              const x2 = 50 + 50 * Math.cos(endRad);
              const y2 = 50 + 50 * Math.sin(endRad);
              
              const largeArcFlag = sector.angle > 180 ? 1 : 0;
              
              const d = `M50,50 L${x1},${y1} A50,50 0 ${largeArcFlag},1 ${x2},${y2} Z`;

              return (
                <G key={index}>
                  <Path 
                    d={d} 
                    fill={sector.isWinner ? "url(#winnerGrad)" : sector.color} 
                    stroke="#111" 
                    strokeWidth="0.5" 
                  />
                </G>
              );
            })}
          </Svg>
          
          {SECTORS.map((sector, index) => {
             let startAngle = 0;
             for(let i=0; i<index; i++) startAngle += SECTORS[i].angle;
             const midAngle = startAngle + sector.angle / 2;
             
             return (
                 <View key={index} style={[styles.sectorLabelContainer, { transform: [{ rotate: `${midAngle}deg` }] }]}>
                     <View style={styles.textWrapper}>
                        <Text style={[styles.sectorTextMain, { color: sector.textColor, fontSize: sector.isWinner ? 14 : 18 }]}>{sector.label}</Text>
                        <Text style={[styles.sectorTextSub, { color: sector.textColor, fontSize: sector.isWinner ? 8 : 10 }]}>{sector.sub}</Text>
                     </View>
                 </View>
             );
          })}
          
          <View style={styles.centerHub}>
             <View style={styles.centerHubInner} />
          </View>
        </Animated.View>
      </View>

      <TouchableOpacity 
        style={[styles.spinButton, spinning && styles.spinButtonDisabled]} 
        onPress={handleSpinPress} 
        disabled={spinning}
      >
        <Text style={styles.spinButtonText}>{spinning ? 'SPINNING...' : 'SPIN TO WIN'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const TryAgainModal = ({ visible, onRetry }) => (
    <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.cleanModalContent}>
                <View style={[styles.iconBadge, { backgroundColor: '#333' }]}>
                    <Ionicons name="refresh" size={32} color="#FFF" />
                </View>
                
                <Text style={styles.cleanTitle}>So Close!</Text>
                <Text style={styles.cleanSubtitle}>You didn't win this time, but we'll give you one more shot.</Text>
                
                <TouchableOpacity 
                    style={[styles.cleanButton, { backgroundColor: '#333' }]}
                    activeOpacity={0.8}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        onRetry();
                    }}
                >
                    <Text style={[styles.cleanButtonText, { color: '#FFF' }]}>Spin Again</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

const WinnerModal = ({ visible, onClaim }) => (
    <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={[styles.cleanModalContent, { borderColor: '#FF9500', borderWidth: 2 }]}>
                <View style={[styles.iconBadge, { backgroundColor: 'rgba(255, 149, 0, 0.15)' }]}>
                    <Ionicons name="trophy" size={36} color="#FF9500" />
                </View>

                <Text style={styles.cleanTitle}>Congratulations!</Text>
                <Text style={styles.cleanSubtitle}>You've unlocked an exclusive offer.</Text>
                
                <View style={styles.cleanPriceContainer}>
                    <Text style={[styles.cleanPriceMain, { color: '#FF9500' }]}>50%</Text>
                    <Text style={[styles.cleanPriceSub, { color: '#FF9500' }]}>OFF</Text>
                </View>
                
                <TouchableOpacity 
                    style={[styles.cleanButton, { backgroundColor: '#FF9500' }]} 
                    activeOpacity={0.8}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        onClaim();
                    }}
                >
                    <Text style={[styles.cleanButtonText, { color: '#000' }]}>Claim Offer</Text>
                </TouchableOpacity>
            </View>
            <Confetti />
        </View>
    </Modal>
);

export default function RewardWheel() {
  const router = useRouter();
  const [showWinner, setShowWinner] = useState(false);
  const [showTryAgain, setShowTryAgain] = useState(false);
  // Random time between 1h 15m (4500s) and 1h 45m (6300s)
  const [timeLeft, setTimeLeft] = useState(() => Math.floor(4500 + Math.random() * 1800)); 

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeParts = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      h: hours.toString().padStart(2, '0'),
      m: minutes.toString().padStart(2, '0'),
      s: seconds.toString().padStart(2, '0')
    };
  };

  const time = formatTimeParts(timeLeft);

  const handleClaim = () => {
    setShowWinner(false);
    router.replace({ pathname: '/utils/PaywallDiscount', params: { discount: '50' } });
  };

  return (
    <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <Text style={styles.limitedOfferLabel}>LIMITED OFFER</Text>
            <Text style={styles.timeLeftLabel}>TIME LEFT</Text>
            <View style={styles.timerContainer}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeValue}>{time.h}</Text>
                <Text style={styles.timeLabel}>HOURS</Text>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeBlock}>
                <Text style={styles.timeValue}>{time.m}</Text>
                <Text style={styles.timeLabel}>MINS</Text>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeBlock}>
                <Text style={styles.timeValue}>{time.s}</Text>
                <Text style={styles.timeLabel}>SECS</Text>
              </View>
            </View>
            
            <Text style={styles.subtitle}>Spin for a chance to win a huge discount</Text>
        </View>

        <Wheel 
            onFinished={() => setShowWinner(true)} 
            onTryAgain={() => setShowTryAgain(true)}
        />

        <WinnerModal visible={showWinner} onClaim={handleClaim} />
        
        <TryAgainModal 
            visible={showTryAgain} 
            onRetry={() => setShowTryAgain(false)} 
        />

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { marginBottom: 30, alignItems: 'center', width: '100%' },
  limitedOfferLabel: { fontSize: 28, color: '#FF9500', marginBottom: 15, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
  timeLeftLabel: { fontSize: 10, color: '#666', marginBottom: 8, letterSpacing: 1.5, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#AAA', marginTop: 20, letterSpacing: 0.5 },
  
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  timeBlock: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 70,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  timeLabel: {
    fontSize: 10,
    color: '#CCCCCC',
    fontWeight: '700',
    marginTop: 2,
    opacity: 0.8,
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginHorizontal: 5,
    marginTop: -15, // Align with numbers
  },
  
  wheelContainer: { alignItems: 'center', justifyContent: 'center' },
  wheelBorder: {
      padding: 5,
      backgroundColor: '#333',
      borderRadius: 160,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
  },
  wheel: { width: 300, height: 300, position: 'relative', borderRadius: 150, overflow: 'hidden' },
  
  stopperContainer: {
      position: 'absolute',
      top: -30,
      zIndex: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 2,
  },
  stopper: {
      marginBottom: -15, // Adjust to overlap slightly
  },

  centerHub: {
      position: 'absolute',
      top: 130,
      left: 130,
      width: 40,
      height: 40,
      backgroundColor: '#FFF',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
  },
  centerHubInner: {
      width: 30,
      height: 30,
      backgroundColor: '#222',
      borderRadius: 15,
  },

  spinButton: {
    marginTop: 50,
    backgroundColor: '#FFF',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  spinButtonDisabled: {
      opacity: 0.5,
      shadowOpacity: 0,
  },
  spinButtonText: { fontWeight: '900', fontSize: 18, color: '#000', letterSpacing: 1 },
  
  sectorLabelContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
      position: 'absolute',
      right: 30,
      width: 80,
      alignItems: 'center',
      transform: [{ rotate: '90deg' }], // Rotate text to be readable
  },
  sectorTextMain: {
    fontSize: 18,
    fontWeight: '900',
  },
  sectorTextSub: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: -2,
  },

  // Modal Styles
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  cleanModalContent: {
      width: '85%',
      backgroundColor: '#151515',
      borderRadius: 20,
      padding: 32,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
  },
  iconBadge: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
  },
  cleanTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: '#FFF',
      marginBottom: 12,
      textAlign: 'center',
      letterSpacing: 0.5,
  },
  cleanSubtitle: {
      fontSize: 16,
      color: '#AAA',
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 24,
      paddingHorizontal: 10,
  },
  cleanButton: {
      width: '100%',
      paddingVertical: 18,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
  },
  cleanButtonText: {
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
  },
  cleanPriceContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 32,
  },
  cleanPriceMain: {
      fontSize: 60,
      fontWeight: '900',
      color: '#FF9500',
      lineHeight: 70,
  },
  cleanPriceSub: {
      fontSize: 24,
      fontWeight: '800',
      color: '#FF9500',
      marginLeft: 8,
  },
});