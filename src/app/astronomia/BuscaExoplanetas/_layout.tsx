// app/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0066cc',
        tabBarInactiveTintColor: '#777',
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="SearchExoplanet"
        options={{
          title: 'Busca',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="SalvedExoplanet"
        options={{
          title: 'Salvos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}