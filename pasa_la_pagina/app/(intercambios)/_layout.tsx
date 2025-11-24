import { useAuth } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { UserProvider } from "@/contexts/UserContext";
import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

export default function IntercambiosLayout() {
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
                <ChatProvider>
                    <UserProvider>
                        <Slot />
                    </UserProvider>
                </ChatProvider>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
});
