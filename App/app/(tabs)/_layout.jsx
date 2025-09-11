import React from 'react';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#8A95B6',
        tabBarStyle: { 
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: '#000000',
          paddingTop: 10,
        },
        tabBarLabelPosition: 'below-icon',
      }}
    >
      <Tabs.Screen 
        name="home"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen 
        name="statistics"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={28} color={color} />,
        }}
      />
      <Tabs.Screen 
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/modal/settings');
          },
        }}
      />
    </Tabs>
  );
}
