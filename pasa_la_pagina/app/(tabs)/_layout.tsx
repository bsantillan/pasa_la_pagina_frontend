import BottomNavbar from '@/components/ui/BottomNavbar';
import { Slot } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot /> 
      <BottomNavbar></BottomNavbar>
    </View>
  );
}
