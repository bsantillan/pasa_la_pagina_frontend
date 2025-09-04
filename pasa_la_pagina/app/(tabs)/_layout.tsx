import { Slot } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot /> {/* Esto renderiza el screen actual (index o explore) */}
    </View>
  );
}
