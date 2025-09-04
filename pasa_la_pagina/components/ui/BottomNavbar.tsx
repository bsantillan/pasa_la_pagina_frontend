import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; icon: IoniconName; isCenter?: boolean }[] = [
    { name: 'home', icon: 'home-outline' },
    { name: 'search', icon: 'search-outline' },
    { name: 'add', icon: 'add', isCenter: true },
    { name: 'messages', icon: 'chatbubble-outline' },
    { name: 'profile', icon: 'person-outline' },
];

export default function BottomNavbar() {
    const [active, setActive] = useState('home');

    const handlePress = (tabName: string) => {
        setActive(tabName);
    };

    return (
        <View style={styles.container}>
            {TABS.map((tab, index) => {
                const isActive = active === tab.name;

                if (tab.isCenter) {
                    return (
                        <View key={index} style={styles.centerWrapper}>
                            <TouchableOpacity
                                style={styles.centerButton}
                                onPress={() => handlePress(tab.name)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name={tab.icon} size={32} color={Colors.white} />
                            </TouchableOpacity>
                        </View>
                    );
                }

                return (
                    <TouchableOpacity
                        key={index}
                        style={styles.tabButton}
                        onPress={() => handlePress(tab.name)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={tab.icon}
                            size={28}
                            color={isActive ? Colors.primary : Colors.text}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 64,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerWrapper: {
        position: 'relative',
        top: -20,
        width: 64,
        alignItems: 'center',
    },
    centerButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
});
