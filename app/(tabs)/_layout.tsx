import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarStyle: { 
        display: 'none',
        backgroundColor: '#000000' 
      },
      tabBarActiveTintColor: '#ffffff',
      tabBarInactiveTintColor: '#808080',
    }}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
