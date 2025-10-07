import React from 'react';
import { View, StyleSheet, Image, Animated, Dimensions, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const Star = ({ size, x, y, delay }) => {
  const opacity = new Animated.Value(0);
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: Math.random() * 0.6 + 0.2,
          duration: Math.random() * 1500 + 1000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.1,
          duration: Math.random() * 1500 + 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[styles.star, { width: size, height: size, borderRadius: size / 2, left: x, top: y, opacity }]} />;
};

const RocketAnimation = ({ onAnimationFinish }) => {
  const rocketTranslateY = React.useRef(new Animated.Value(height / 2.5)).current;
  const rocketScale = React.useRef(new Animated.Value(0.7)).current;
  const rocketOpacity = React.useRef(new Animated.Value(0)).current;
  const glowOpacity = React.useRef(new Animated.Value(0)).current;
  const textOpacity = React.useRef(new Animated.Value(0)).current;
  const hoverAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const hover = Animated.loop(
      Animated.sequence([
        Animated.timing(hoverAnim, {
          toValue: 5,
          duration: 1000, // Faster hover
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(hoverAnim, {
          toValue: 0,
          duration: 1000, // Faster hover
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const entranceAnimation = Animated.parallel([
      Animated.timing(rocketOpacity, {
        toValue: 1,
        duration: 800, // Faster
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rocketTranslateY, {
        toValue: 0,
        duration: 800, // Faster
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rocketScale, {
        toValue: 1,
        duration: 800, // Faster
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 800, // Faster
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 700, // Faster
        delay: 100,      // Faster
        useNativeDriver: true,
      }),
    ]);

    const exitAnimation = Animated.parallel([
      Animated.timing(rocketTranslateY, {
        toValue: -height,
        duration: 800, // Faster
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rocketScale, {
        toValue: 0.5,
        duration: 800, // Faster
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rocketOpacity, {
        toValue: 0,
        duration: 600, // Faster
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 600, // Faster
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 400, // Faster
        useNativeDriver: true,
      }),
    ]);

    entranceAnimation.start(() => {
      hover.start();
      Animated.sequence([
        Animated.delay(400), // Shortened delay
        exitAnimation
      ]).start(() => {
        hover.stop();
        if (onAnimationFinish) {
          onAnimationFinish();
        }
      });
    });

    return () => {
      hover.stop();
    };
  }, []);

  const stars = React.useMemo(() => Array.from({ length: 150 }).map((_, i) => (
    <Star key={i} size={Math.random() * 2.5 + 1} x={Math.random() * width} y={Math.random() * height} delay={Math.random() * 2000} />
  )), []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#010103', '#101018']} style={StyleSheet.absoluteFill} />
      {stars}
      
      <Animated.View style={[styles.contentContainer, { transform: [{ translateY: hoverAnim }] }]}>
        <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
        <Animated.Image
          source={require('../assets/RocketImage2.png')}
          style={[
            styles.rocket,
            {
              opacity: rocketOpacity,
              transform: [{ scale: rocketScale }, { translateY: rocketTranslateY }],
            },
          ]}
        />
      </Animated.View>
      
      <Animated.Text style={[styles.logoText, { opacity: textOpacity }]}>
        Boost
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFF',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 250,
    height: 250,
    backgroundColor: '#A54207',
    borderRadius: 125,
    shadowColor: '#A54207',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 100,
    elevation: 20, // for Android
  },
  rocket: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  logoText: {
    position: 'absolute',
    bottom: height * 0.2,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
});

export default RocketAnimation;
