import BottomNavbar from '@/components/ui/BottomNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { Slot, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';


export default function TabLayout() {
  const { accessToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login"); 
    }
  }, [accessToken]);

  if (!accessToken) return null; 

  return (
    <View style={{ flex: 1 }}>
      <Slot /> 
      <BottomNavbar></BottomNavbar>
    </View>
  );
}
