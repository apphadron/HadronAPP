import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SensoresLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'SensoresScreen') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'SensoresScreen') {
            iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
          } else if (route.name === 'SensoresGraph') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else {
            iconName = 'arrow-up-circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#1F2937',
        },
        headerTintColor: '#FFFFFF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
      })}
    >
      <Tabs.Screen 
        name="SensoresScreen" 
        options={{ 
          title: 'Sensores',
          headerTitle: 'Sensores'
        }}
      />
      <Tabs.Screen 
        name="SensoresGraph" 
        options={{ 
          title: 'Gráficos',
          headerTitle: 'Gráficos'
        }}
      />
    </Tabs>
  );
} 