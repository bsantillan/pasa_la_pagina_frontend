import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const TABS = [
  { name: "home", label: "Home", icon: "home-outline", activeIcon: "home" },
  {
    name: "search",
    label: "Search",
    icon: "search-outline",
    activeIcon: "search",
  },
  { name: "add", label: "", icon: "add", isCenter: true },
  {
    name: "messages",
    label: "Message",
    icon: "chatbubble-outline",
    activeIcon: "chatbubble",
  },
  {
    name: "profile",
    label: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
];

export default function BottomNavbar() {
  const [active, setActive] = useState("home");

  const handlePress = (tabName: string) => {
    setActive(tabName);
    switch (tabName) {
      case "home":
        router.replace("/(tabs)")
        break;
      case "search":
        router.push("/explore");
        break;
      case "messages":
        //router.push('/messages'); // Ajusta según tu ruta real
        break;
      case "profile":
        //router.push('/profile'); // Ajusta según tu ruta real
        break;
      case "add":
        router.push("/(publicacion)");
        break;
    }
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
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={32} color={Colors.white} />
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
              name={isActive ? (tab.activeIcon as any) : (tab.icon as any)}
              size={24}
              color={isActive ? Colors.primary : Colors.text}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? Colors.primary : Colors.text },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 64,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
  centerWrapper: {
    position: "relative",
    top: -20,
    width: 64,
    alignItems: "center",
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
