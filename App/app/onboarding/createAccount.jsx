import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function CreateAccount() {
  const router = useRouter();

  const handleAppleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement Apple Sign In
    console.log('Apple Sign In');
  };

  const handleGoogleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement Google Sign In
    console.log('Google Sign In');
  };

  const handleEmailSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/modal/signup');
  };

  return (
    <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Become the MAN</Text>

          <View style={styles.optionsContainer}>
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
          </View>
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
  title: {
    color: '#FFFFFF',
    fontSize: 28,
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
