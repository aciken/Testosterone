import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../context/GlobalProvider';

export default function CreateAccount() {
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useGlobalContext();

  // 451475688741-f88vp91ttocl4of0lv8ja22m7d9ttqip.apps.googleusercontent.com

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // CRUCIAL CHECK: Ensure the idToken exists before proceeding.
      if (!userInfo || !userInfo.idToken) {
        console.error("CRITICAL: Google Sign-In succeeded but did not return an idToken. Please verify your 'webClientId' in the Google Cloud Console is for a 'Web application' credential, not an iOS or Android one.");
        // Here you could show an alert to the user
        return;
      }
      
      const response = await axios.post('https://26e4f9703e03.ngrok-free.app/auth/google', {
        token: userInfo.idToken,
      });

      if (response.status === 200 || response.status === 201) {
        const userData = response.data;
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        router.push('/home');
      } else {
        console.error('Google Sign-In failed:', response.data.message);
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      const { user, email, fullName } = credential;
      const name = fullName ? `${fullName.givenName} ${fullName.familyName}` : 'User';
      
      const response = await axios.post('https://26e4f9703e03.ngrok-free.app/auth/apple', {
        appleId: user,
        email,
        name,
      });

      if (response.status === 200 || response.status === 201) {
        const userData = response.data;
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);

        // For Apple Sign-In, verification is implicit, so navigate to home or paywall
        router.push('/home'); 
      } else {
        // Handle non-successful responses
        console.error('Apple Sign-In failed:', response.data.message);
      }

    } catch (e) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        console.log('User canceled Apple Sign-In.');
      } else {
        console.error('Apple Sign-In error:', e);
      }
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '451475688741-f88vp91ttocl4of0lv8ja22m7d9ttqip.apps.googleusercontent.com', // Replace with your Web Client ID
      iosClientId: '451475688741-f88vp91ttocl4of0lv8ja22m7d9ttqip.apps.googleusercontent.com', // Replace with your iOS Client ID
      requestIdToken: true, // This is mandatory to receive the idToken
    });

    // Animate content in
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

  return (
    <LinearGradient 
      colors={['#FF8C00', '#4B1D04', '#000000']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Animated.Image 
            source={require('../../assets/Portal4.png')} 
            style={[
              styles.portalImage,
              { 
                opacity: fadeAnim, 
                transform: [{ translateY: slideAnim }] 
              }
            ]} 
          />
          <Animated.Text 
            style={[
              styles.title,
              { 
                opacity: fadeAnim, 
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            BOOST the Test
          </Animated.Text>

          <Animated.View 
            style={[
              styles.optionsContainer,
              { opacity: fadeAnim }
            ]}
          >
            {/* Apple Sign In */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleAppleSignIn}
            >
              <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
              <Text style={styles.optionButtonText}>Continue with Apple</Text>
            </TouchableOpacity>

            {/* Google Sign In */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleGoogleSignIn}
            >
              <Image source={require('../../assets/search.png')} style={styles.iconImage} />
              <Text style={styles.optionButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  portalImage: {
    width: 320,
    height: 320,
    resizeMode: 'contain',
    marginBottom: 50,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  iconImage: {
    width: 24,
    height: 24,
  },
});
