import { View, Text, TouchableOpacity, SafeAreaView, Animated, Image, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from './context/GlobalProvider';
import { useRouter } from 'expo-router';

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');

// Updated icons using Ionicons with neon colors from design instructions
const ChartIcon = () => (
  <Ionicons name="analytics-outline" size={22} color="#00DDFF" />
);

const AnalyticsIcon = () => (
  <Ionicons name="bar-chart-outline" size={22} color="#FF00FF" />
);

const PersonalizedIcon = () => (
  <Ionicons name="sparkles-outline" size={22} color="#FFFF00" />
);

export default function WelcomePage() {
  const router = useRouter();
  const {setUser, setIsAuthenticated, isAuthenticated} = useGlobalContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  // State to track if we have a photo to display
  const [hasPhoto, setHasPhoto] = useState(false);
  // You can replace this with your actual photo URL or require statement
  const photoSource = null;

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0C1126' }}>
      <StatusBar style="light" />
      
      <Animated.View 
        style={{ 
          flex: 1, 
          paddingHorizontal: 24, 
          paddingVertical: 16, 
          justifyContent: 'space-between',
          opacity: fadeAnim, 
          transform: [{ translateY: slideAnim }] 
        }}
      >
        {/* Photo Section - Will be empty if no photo */}
        <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
          {hasPhoto ? (
            <Image
              source={photoSource}
              style={{
                width: width * 0.85,
                height: width * 1.2,
                borderRadius: 24,
              }}
              resizeMode="cover"
            />
          ) : (
            // Empty view when no photo is available
            <View style={{ width: width * 0.85, height: width * 0.5 }} />
          )}
        </View>

        {/* Bottom Section - Welcome Text and Buttons */}
        <View style={{ width: '100%', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
            App Name
          </Text>
          
          <Text style={{ color: '#B3B8C8', fontSize: 18, marginBottom: 32, textAlign: 'center', lineHeight: 24 }}>
            Your app's description goes here. Highlight main features and benefits.
          </Text>
          
          <Link href="/modal/signup" asChild>
            <TouchableOpacity 
              style={{
                backgroundColor: '#00DDFF',
                width: '100%',
                paddingVertical: 16,
                borderRadius: 30,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#0C1126', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                Get Started
              </Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/modal/signin" asChild>
            <TouchableOpacity 
              style={{
                borderWidth: 1,
                borderColor: '#5B6188',
                paddingVertical: 12,
                borderRadius: 30,
                width: '100%',
              }}
            >
              <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 16 }}>
                Already have an account?
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const FeatureItem = ({ icon, title, description }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
    <View style={{ 
      backgroundColor: '#1E2747', 
      width: 48, 
      height: 48, 
      borderRadius: 16, 
      alignItems: 'center', 
      justifyContent: 'center',
      marginRight: 16 
    }}>
      {icon}
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: 'white', marginBottom: 4 }}>{title}</Text>
      <Text style={{ fontSize: 14, color: '#B3B8C8' }}>{description}</Text>
    </View>
  </View>
);
