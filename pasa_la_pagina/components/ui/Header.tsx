import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificacionContext";
import { usePublicacion } from "@/contexts/PublicacionContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useSegments } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import FilterModal from "./FilterModal";

export default function Header() {
    const router = useRouter();
    const segments = useSegments() as string[];
    const isPerfilIndex = segments.length === 1 && segments[0] === "(perfil)";

    // ⚠️ IMPORTANTE: aseguramos que los params existan siempre correctamente
    const params = useLocalSearchParams<{
        usuarioId?: string;
        fromPublicacion?: string;
        id?: string;
        query?: string;
    }>();

    const [openFilter, setOpenFilter] = useState(false);

    const { logout } = useAuth();
    const { filtros, cargarinicial, setFiltros } = usePublicacion();
    const { notificaciones } = useNotifications();
    const unreadCount = notificaciones.length;

    const isInTabsRoot = segments[0] === "(tabs)" && segments.length === 1;
    const isInNotificaciones = segments.includes("(notificaciones)");

    // ✔ Detecta correctamente "/(perfil)/usuario" aunque haya _layout
    const isInUsuarioPerfil =
        segments.includes("(perfil)") &&
        (segments.at(-1) === "usuario" || segments.includes("usuario"));

    const handleSubmitEditing = async () => {
        if (segments.includes("listado")) {
            await cargarinicial();
        } else {
            router.push("/listado");
        }
    };

    // ✔ FIX COMPLETO DEL BOTÓN ATRÁS
    const handleBack = () => {

        // Si venimos desde visualizar, debemos volver exactamente ahí
        if (isInUsuarioPerfil && params.fromPublicacion) {
            router.push({
                pathname: "/(tabs)/visualizar/[id]",
                params: { id: params.fromPublicacion }
            } as any);
            return;
        }

        // Por defecto solo volvemos a la pantalla previa
        router.back();
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>

                {!isInTabsRoot && (
                    <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                )}

                {isInNotificaciones ? (
                    <View style={styles.notificacionesContainer}>
                        <Text style={styles.notificacionesText}>Notificaciones</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={18} color="#999" style={{ marginRight: 6 }} />
                            <TextInput
                                style={styles.input}
                                placeholder="Buscar publicaciones..."
                                placeholderTextColor="#888"
                                value={filtros.query}
                                onChangeText={(text) => setFiltros({ query: text })}
                                onSubmitEditing={handleSubmitEditing}
                                returnKeyType="search"
                            />
                        </View>

                        <View style={styles.rightIcons}>
                            {segments.includes("listado") && (
                                <TouchableOpacity onPress={() => setOpenFilter(true)} style={styles.filterBtn}>
                                    <Ionicons name="funnel" size={20} color={Colors.primary} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={styles.notificationBtn}
                                onPress={() => router.push("../(notificaciones)")}
                            >
                                <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
                                {unreadCount > 0 && (
                                    <View style={styles.notificationBadge}>
                                        <Text style={styles.notificationBadgeText}>
                                            {unreadCount}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            {isPerfilIndex && (
                                <TouchableOpacity onPress={() => { logout(); router.push("/login"); }} style={styles.filterBtn}>
                                    <Ionicons name="log-out-outline" size={25} color={Colors.primary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                )}
            </View>

            {!isInNotificaciones && (
                <FilterModal visible={openFilter} onClose={() => setOpenFilter(false)} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingHorizontal: 16,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderColor: "#E6E6E6",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconBtn: {
        padding: 6,
    },
    notificacionesContainer: {
        flex: 1,
        alignItems: "center",
    },
    notificacionesText: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text,
        textAlign: "center",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingHorizontal: 10,
        height: 40,
        flex: 1,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: "#DADADA",
    },
    input: {
        flex: 1,
        height: "100%",
        fontSize: 14,
        color: "#000",
    },
    rightIcons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    notificationBtn: {
        position: "relative",
        padding: 6,
    },
    filterBtn: {
        paddingHorizontal: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    notificationBadge: {
        position: "absolute",
        right: -2,
        top: -2,
        backgroundColor: Colors.primary,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    notificationBadgeText: {
        color: "white",
        fontSize: 10,
        fontWeight: "bold",
    },
});
