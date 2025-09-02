import React from 'react';
import { View, Text, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FriendsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0C1126' }}>
      <StatusBar style="light" />
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <Ionicons name="people" size={40} color="#00DDFF" />
        <Text style={{ 
          color: '#FFFFFF', 
          fontSize: 18, 
          marginTop: 12 
        }}>Friends</Text>
      </View>
    </SafeAreaView>
  );
}
