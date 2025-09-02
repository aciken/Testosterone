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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


// Temporarily comment out AsyncStorage if not installed
// import AsyncStorage from '@react-native-async-storage/async-storage';

// Temporarily comment out axios if not installed
// import axios from 'axios';

export default function Signup() {
  // Remove GlobalContext reference temporarily
  // const { setUser } = useGlobalContext();
    const { setError, setIsAuthenticated, setUser, isAuthenticated } = useGlobalContext();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  
  
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
    // Check if passwords match when either password field changes
    if (confirmPassword !== '') {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    if(isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated]);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');


  // --- Validation Functions ---
  const isValidEmail = (emailToTest) => {

    // Basic email regex - adjust if needed for more strictness

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToTest);

    
  };

  useEffect(() => {
    // Don't show error if email is empty
    if (!email) {
      setEmailError('');
      return; 
    }
    // Show error if email is not empty AND invalid
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError(''); // Clear error if valid
    }
  }, [email]);

  const isValidPassword = (passwordToTest) => {
    // At least 8 characters, at least one number
    const passwordRegex = /^(?=.*\d).{8,}$/;
    return passwordRegex.test(passwordToTest);
  };

    useEffect(() => {
    // Don't show error if password is empty
    if (!password) {
      setPasswordError('');
      return;
    }
     // Show error if password is not empty AND invalid
    if (!isValidPassword(password)) {
      setPasswordError('Password must be 8+ chars & contain 1 number.'); // Shortened message
    } else {
      setPasswordError(''); // Clear error if valid
    }
  }, [password]);
  // --- End Validation Functions ---

  const handleSignUp = async () => {
    setError(null); // Clear previous errors

    // 1. Check if all fields are filled
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    // 2. Check email format
    if (!isValidEmail(email)) {
        Alert.alert('Error', 'Please enter a valid email address.');
        return;
    }

    // 3. Check password requirements
    if (!isValidPassword(password)) {
        Alert.alert('Error', 'Password must be at least 8 characters long and contain at least one number.');
        return;
    }

    // 4. Check if passwords match
    if (!passwordsMatch) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    
    // --- If all validation passes, proceed with API call ---
    console.log("Validation passed, attempting sign up...");
    try {
      const response = await axios.put('https://4c922cd8e3b6.ngrok-free.app/signup', { // Ensure URL is correct
        name: name.trim(), // Send trimmed name
        email: email.trim(), // Send trimmed email
        password // Send original password
      });
      
      console.log("API Response Status:", response.status);
      console.log("API Response Data:", JSON.stringify(response.data, null, 2));

      if(response.status === 200) { // Check for user object
          await AsyncStorage.setItem('user', JSON.stringify(response.data));
          setUser(response.data); 
          router.replace('/modal/verify');



      } else {
          const message = response.data?.message || "Sign up failed. Invalid response from server.";
          setError(message);
          Alert.alert( message);
      }
    } catch (error) {
        let message = "An unexpected error occurred during sign up.";
        if (error.response) {
          message = error.response.data?.message || `Server error: ${error.response.status}`;
        } else if (error.request) {
          message = "No response from server.";
        } else {
          message = error.message || "Error setting up request.";
        }
        setError(message);
        Alert.alert("Sign Up Error", message); 
    }
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
              Create Account
            </Text>
            <Text style={{ color: '#B3B8C8', fontSize: 18, marginBottom: 32, textAlign: 'center' }}>
              Start your journaling journey
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
                placeholder="Your Name"
                placeholderTextColor="#8A92B2"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <TextInput
                style={{
                  backgroundColor: '#1E2747',
                  color: 'white',
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 30,
                  fontSize: 16,
                  borderWidth: emailError ? 1 : 0,
                  borderColor: emailError ? '#FF3B30' : 'transparent'
                }}
                placeholder="Your Email"
                placeholderTextColor="#8A92B2"
                value={email}
                onChangeText={(text) => setEmail(text.trim())}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError ? (
                <View style={{ marginTop: 4, marginLeft: 16 }}>
                  <Text style={{ color: '#FF3B30', fontSize: 12 }}>{emailError}</Text>
                </View>
              ) : null}
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <TextInput
                style={{
                  backgroundColor: '#1E2747',
                  color: 'white',
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 30,
                  fontSize: 16,
                  borderWidth: passwordError ? 1 : 0,
                  borderColor: passwordError ? '#FF3B30' : 'transparent'
                }}
                placeholder="Create Password"
                placeholderTextColor="#8A92B2"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {passwordError ? (
                <View style={{ marginTop: 4, marginLeft: 16 }}>
                  <Text style={{ color: '#FF3B30', fontSize: 12 }}>{passwordError}</Text>
                </View>
              ) : null}
            </View>
            
            <View style={{ marginBottom: 8 }}>
              <TextInput
                style={{
                  backgroundColor: '#1E2747',
                  color: 'white',
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 30,
                  fontSize: 16,
                  borderWidth: (!passwordsMatch && confirmPassword) ? 1 : 0,
                  borderColor: (!passwordsMatch && confirmPassword) ? '#FF3B30' : 'transparent'
                }}
                placeholder="Confirm Password"
                placeholderTextColor="#8A92B2"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
            
            {/* Password match error */}
            {!passwordsMatch && confirmPassword ? (
              <Text style={{ color: '#FF3B30', fontSize: 12, marginTop: 4, marginBottom: 12, marginLeft: 16 }}>
                Passwords don't match
              </Text>
            ) : <View style={{ height: 18, marginBottom: 3}} />}
            
            {/* Terms and Privacy */}
            <Text style={{ color: '#8A92B2', fontSize: 12, textAlign: 'center', marginBottom: 24 }}>
              By signing up, you agree to our{' '}
              <Text style={{ color: '#00DDFF', textDecorationLine: 'underline' }}>Terms of Service</Text> and{' '}
              <Text style={{ color: '#00DDFF', textDecorationLine: 'underline' }}>Privacy Policy</Text>
            </Text>
            
            {/* Sign Up Button */}
            <TouchableOpacity 
              style={{
                backgroundColor: '#00DDFF',
                paddingVertical: 16,
                borderRadius: 30,
                marginBottom: 24
              }}
              onPress={handleSignUp}
            >
              <Text style={{ color: '#0C1126', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                Create Account
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
            
            {/* Already have an account */}
            <TouchableOpacity 
              style={{ marginBottom: 32 }}
              onPress={() => router.push('/modal/signin')}
            >
              <Text style={{ color: '#B3B8C8', textAlign: 'center', fontSize: 16 }}>
                Already have an account? <Text style={{ color: '#00DDFF' }}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
