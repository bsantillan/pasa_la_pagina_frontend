import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { Slot, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificacionesLayout() {
    const { accessToken } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!accessToken) {
            router.replace("/login");
        }
    }, [accessToken, router]);

    if (!accessToken) return null;

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Slot />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },

});
