import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const SettingOption = ({ icon, text, onPress, isDestructive }) => (
  <TouchableOpacity 
    style={styles.optionButton}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }}
  >
    <Ionicons name={icon} size={24} color={isDestructive ? '#FF453A' : '#8A95B6'} />
    <Text style={[styles.optionText, isDestructive && styles.destructiveText]}>{text}</Text> 
    {!isDestructive && <Ionicons name="chevron-forward" size={20} color="#555" />}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { setIsAuthenticated, setUser } = useGlobalContext();

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsAuthenticated(false);
              setUser(null);
              await AsyncStorage.removeItem('user');
              router.replace('/'); 
            } catch (e) {
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          } 
        }
      ]
    );
  };

  return (
    <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.doneButton}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.section}>
            <SettingOption icon="person-outline" text="Account" onPress={() => {}} />
            <SettingOption icon="notifications-outline" text="Notifications" onPress={() => {}} />
            <SettingOption icon="shield-checkmark-outline" text="Privacy Policy" onPress={() => {}} />
          </View>

          <View style={styles.section}>
            <SettingOption 
              icon="log-out-outline" 
              text="Log Out" 
              onPress={handleLogout}
              isDestructive 
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollViewContent: {
    padding: 20,
  },
  section: {
    backgroundColor: '#1C1C1E',
    borderRadius: 15,
    marginBottom: 30,
    overflow: 'hidden',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 20,
    flex: 1,
  },
  destructiveText: {
    color: '#FF453A',
  },
}); 