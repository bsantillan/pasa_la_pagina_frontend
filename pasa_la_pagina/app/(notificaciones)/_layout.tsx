import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { Slot, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

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
        <View style={styles.container}>
            <Slot />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

});
