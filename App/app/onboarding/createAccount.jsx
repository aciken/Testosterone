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

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('Google User Info:', userInfo);
      // TODO: Send the userInfo.idToken to your backend for verification
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
      
      const response = await axios.post('https://dfc73de1bf32.ngrok-free.app/auth/apple', {
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

  const handleEmailSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/modal/signup');
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Replace with your Web Client ID
      iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', // Replace with your iOS Client ID
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

            {/* Email Sign Up */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleEmailSignUp}
            >
              <Ionicons name="mail" size={24} color="#FFFFFF" />
              <Text style={styles.optionButtonText}>Continue with Email</Text>
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
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
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
