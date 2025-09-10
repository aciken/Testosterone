import { View, Text, TouchableOpacity, SafeAreaView, Animated, Image, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from './context/GlobalProvider';
import { useRouter } from 'expo-router';

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');

export default function WelcomePage() {
  const router = useRouter();
  const {setUser, setIsAuthenticated, isAuthenticated} = useGlobalContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        // User exists, route to home
        router.replace('/home');
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#0C1126', '#000000']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <StatusBar style="light" />
        
        <Animated.View 
          style={{ 
            flex: 1, 
            paddingHorizontal: 24, 
            justifyContent: 'space-between',
            alignItems: 'center',
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }] 
          }}
        >
          {/* Top Section - Logo */}
          <View style={{ marginTop: 40 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', letterSpacing: 4 }}>
              TESTOSTERONE
            </Text>
          </View>

          {/* Middle Section - Welcome Text */}
          <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={{
              color: '#FFFFFF',
              fontSize: 48,
              fontWeight: 'bold',
              marginBottom: 20,
              textAlign: 'center',
              textShadowColor: 'rgba(0, 0, 0, 0.75)',
              textShadowOffset: {width: 2, height: 2},
              textShadowRadius: 5,
            }}>
              Welcome!
            </Text>
            <Text style={{
              color: '#FFFFFF',
              fontSize: 22,
              textAlign: 'center',
              lineHeight: 30,
              textShadowColor: 'rgba(0, 0, 0, 0.75)',
              textShadowOffset: {width: 2, height: 2},
              textShadowRadius: 5,
            }}>
              Let's start by finding out if you have a problem with low testosterone
            </Text>
          </View>

          {/* Bottom Section - Buttons */}
          <View style={{ width: '100%', alignItems: 'center', marginBottom: 40 }}>
            <Link href="/onboarding/question1" asChild>
              <TouchableOpacity 
                style={{
                  backgroundColor: '#FFFFFF',
                  width: '90%',
                  paddingVertical: 18,
                  borderRadius: 30,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 20,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.30,
                  shadowRadius: 4.65,
                  elevation: 8,
                }}
              >
                <Text style={{ color: '#000000', textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginRight: 10 }}>
                  Continue
                </Text>
              </TouchableOpacity>
            </Link>
            
            <Link href="/modal/signin" asChild>
              <TouchableOpacity>
                <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 16 }}>
                  Already joined via web?
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}
