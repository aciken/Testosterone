import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../context/GlobalProvider';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Temporarily comment out AsyncStorage if not installed
// import AsyncStorage from '@react-native-async-storage/async-storage';

// Temporarily comment out axios if not installed
// import axios from 'axios';

export default function Signin() {
  const { login, setError, setIsAuthenticated, setUser, isAuthenticated } = useGlobalContext();
  // Remove GlobalContext reference temporarily
  // const { setUser } = useGlobalContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if(isAuthenticated) {
      console.log("sending to home");
      router.replace('/home');
    }
  }, [isAuthenticated]);

  const handleSignIn = async () => {

    if(email === '' || password === '') {
      Alert.alert( "Please enter email and password");
      return;
    }


    console.log(email, password);
      axios.post('https://4c922cd8e3b6.ngrok-free.app/signin', { email, password })
      .then((response) => {
        if(response.status === 200) {
          setUser(response.data);
          if(response.data.verification != 1) {
            router.replace('/modal/verify');
          } else {
            setIsAuthenticated(true);  
            AsyncStorage.setItem('user', JSON.stringify(response.data));
          }



        }
      })
      .catch((error) => {
        console.log(error);
      })

  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0C1126' }}>
      <StatusBar style="light" />
      
      {/* Close button */}
      <TouchableOpacity 
        style={{ 
          position: 'absolute', 
          top: 48, 
          right: 24, 
          zIndex: 10 
        }}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <Animated.View 
            style={{ 
              paddingHorizontal: 24,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            {/* Welcome Text */}
            <Text style={{ color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
              Welcome back
            </Text>
            <Text style={{ color: '#B3B8C8', fontSize: 18, marginBottom: 32, textAlign: 'center' }}>
              Let's get you in to your journal
            </Text>
            
            {/* Input Fields */}
            <View style={{ marginBottom: 16 }}>
              <TextInput
                style={{
                  backgroundColor: '#1E2747',
                  color: 'white',
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 30,
                  fontSize: 16
                }}
                placeholder="Your Email"
                placeholderTextColor="#8A92B2"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={{ marginBottom: 12 }}>
              <TextInput
                style={{
                  backgroundColor: '#1E2747',
                  color: 'white',
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 30,
                  fontSize: 16
                }}
                placeholder="Your Password"
                placeholderTextColor="#8A92B2"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            {/* Forgot Password */}
            <TouchableOpacity style={{ marginBottom: 28 }}>
              <Text style={{ color: '#B3B8C8', textAlign: 'center', fontSize: 14 }}>
                Forgot password?
              </Text>
            </TouchableOpacity>
            
            {/* Sign In Button */}
            <TouchableOpacity 
              style={{
                backgroundColor: '#00DDFF',
                paddingVertical: 16,
                borderRadius: 30,
                marginBottom: 24
              }}
              onPress={handleSignIn}
            >
              <Text style={{ color: '#0C1126', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                Sign in
              </Text>
            </TouchableOpacity>
            
            {/* Divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#2A3455' }} />
              <Text style={{ color: '#B3B8C8', marginHorizontal: 16 }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#2A3455' }} />
            </View>
            
            {/* Continue with Google */}
            <TouchableOpacity 
              style={{
                backgroundColor: '#1E2747',
                paddingVertical: 14,
                borderRadius: 30,
                marginBottom: 24,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Ionicons name="logo-google" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 16 }}>
                Continue with Google
              </Text>
            </TouchableOpacity>
            
            {/* Don't have an account */}
            <TouchableOpacity 
              style={{ marginBottom: 32 }}
              onPress={() =>{ router.back();router.push('/modal/signup')}}
            >
              <Text style={{ color: '#B3B8C8', textAlign: 'center', fontSize: 16 }}>
                Don't have an account? <Text style={{ color: '#00DDFF' }}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
