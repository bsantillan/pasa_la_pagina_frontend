// PerfilUsuarioScreen.tsx - Perfil de otro usuario
import { Avatar } from "@/components/ui/Avatar";
import { ProductCard } from "@/components/ui/ProductCard";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicacion } from "@/contexts/PublicacionContext";
import { useLocalSearchParams, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const filtros = ["Reseñas", "Publicaciones"];

type Usuario = {
    id: number;
    nombre: string;
    apellido: string;
};

type Resenia = {
    id: number;
    usuarioNombre: string;
    valoracion: number;
    descripcion: string;
    fecha: string;
};

export default function PerfilUsuarioScreen() {
    const { usuarioId } = useLocalSearchParams();
    const router = useRouter();
    const { getValidAccessToken } = useAuth();
    const {
        pubsUser,
        fetchPublicacionesByUsuario,
        loading: pubLoading
    } = usePublicacion();
    const segments = useSegments() as string[];


    const [selectedFiltro, setSelectedFiltro] = useState(filtros[0]);
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [resenias, setResenias] = useState<Resenia[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (usuarioId) {
            fetchDatosUsuario();
            // Usar el método del contexto para publicaciones
            fetchPublicacionesByUsuario(Number(usuarioId));
        }
    }, [usuarioId]);

    useEffect(() => {
        console.log(segments);

    }, []);

    const fetchDatosUsuario = async () => {
        setLoading(true);
        setError(null);

        try {
            const accessToken = await getValidAccessToken();

            // ========== FETCH DATOS DEL USUARIO ==========
            try {
                const userResponse = await fetch(
                    `${process.env.EXPO_PUBLIC_API_URL}user/${usuarioId}`,
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );

                if (!userResponse.ok) {
                    throw new Error("Error al obtener datos del usuario");
                }

                const userData = await userResponse.json();
                console.log("✅ Usuario cargado:", userData);
                setUsuario(userData);
            } catch (userErr: any) {
                console.error("❌ Error al cargar usuario:", userErr);
                throw userErr;
            }

            // ========== FETCH RESEÑAS ==========
            try {
                const reseniaUrl = `${process.env.EXPO_PUBLIC_API_URL}resenia/recibidas/${usuarioId}`;
                console.log("🔍 URL de reseñas:", reseniaUrl);

                const reseniasResponse = await fetch(reseniaUrl, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (reseniasResponse.ok) {
                    const reseniasData = await reseniasResponse.json();
                    console.log("⭐ Reseñas raw:", reseniasData);

                    // Verificar diferentes formatos de respuesta
                    let resenas = [];

                    if (Array.isArray(reseniasData)) {
                        resenas = reseniasData;
                    } else if (reseniasData.content) {
                        resenas = reseniasData.content;
                    } else if (reseniasData.resenias) {
                        resenas = reseniasData.resenias;
                    }

                    // Normalizar formato de campos (por si viene en diferentes formatos)
                    resenas = resenas.map((r: any) => ({
                        id: r.id,
                        usuarioNombre: r.usuarioNombre || r.usuario_nombre || "Usuario",
                        valoracion: r.valoracion,
                        descripcion: r.descripcion,
                        fecha: r.fecha || ""
                    }));

                    console.log(`✅ ${resenas.length} reseñas cargadas`);
                    setResenias(resenas);
                } else {
                    const errorText = await reseniasResponse.text();
                    console.warn("⚠️ Error en reseñas:", errorText);

                    // Parsear el error para ver más detalles
                    try {
                        const errorJson = JSON.parse(errorText);
                        console.warn("Error JSON:", errorJson);
                    } catch { }

                    setResenias([]);
                }
            } catch (reseniaErr: any) {
                console.warn("⚠️ Error al cargar reseñas:", reseniaErr.message);
                setResenias([]);
            }

        } catch (err: any) {
            console.error("❌ Error crítico:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderPublicaciones = () => {
        if (!pubsUser.length) {
            return (
                <Text style={{ color: Colors.disabled_primary, textAlign: "center", marginTop: 10 }}>
                    No tiene publicaciones aún.
                </Text>
            );
        }

        return pubsUser.map((p) => (
            <View key={p.id} style={styles.row}>
                <ProductCard
                    title={p.titulo}
                    description={p.descripcion}
                    imageUrl={(p.fotos_url && p.fotos_url[0]) || ""}
                />
            </View>
        ));
    };

    const renderResenias = () => {
        if (!resenias.length) {
            return (
                <Text style={{ color: Colors.disabled_primary, textAlign: "center", marginTop: 10 }}>
                    No tiene reseñas recibidas aún.
                </Text>
            );
        }

        return resenias.map((r) => (
            <ReviewCard
                key={r.id}
                username={r.usuarioNombre}
                headline={`Valoración: ${r.valoracion}`}
                description={r.descripcion}
                date={r.fecha}
            />
        ));
    };

    if (loading || pubLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (error || !usuario) {
        return (
            <View style={styles.center}>
                <Text style={{ color: "red" }}>Error al cargar el perfil</Text>
                <Text style={{ color: Colors.text, marginTop: 8 }}>
                    {error || "Usuario no encontrado"}
                </Text>
                <TouchableOpacity onPress={fetchDatosUsuario} style={{ marginTop: 10 }}>
                    <Text style={{ color: Colors.primary }}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                <View style={styles.header}>
                    <Avatar name={usuario.nombre || "U"} size={80} />
                    <Text style={styles.nombre}>
                        {usuario.nombre} {usuario.apellido}
                    </Text>

                    <View style={styles.filtrosContainer}>
                        {filtros.map((filtro) => (
                            <TouchableOpacity
                                key={filtro}
                                onPress={() => setSelectedFiltro(filtro)}
                                style={[
                                    styles.filtroBtn,
                                    selectedFiltro === filtro && styles.filtroBtnActivo,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.filtroTexto,
                                        selectedFiltro === filtro && styles.filtroTextoActivo,
                                    ]}
                                >
                                    {filtro}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.contenido}>
                    {selectedFiltro === "Publicaciones"
                        ? renderPublicaciones()
                        : renderResenias()
                    }
                </View>
            </ScrollView>
        </View>
    );
}

// ------------------ ESTILOS ------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    header: {
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    nombre: {
        fontSize: 20,
        fontWeight: "700",
        marginTop: 8,
        color: Colors.text,
    },
    filtrosContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 12,
    },
    filtroBtn: {
        borderRadius: 20,
        backgroundColor: Colors.disabled_primary,
        paddingVertical: 6,
        paddingHorizontal: 14,
        marginHorizontal: 4,
    },
    filtroBtnActivo: {
        backgroundColor: Colors.primary,
    },
    filtroTexto: {
        fontSize: 14,
        color: Colors.primary,
    },
    filtroTextoActivo: {
        color: Colors.background,
        fontWeight: "600",
    },
    contenido: {
        flex: 1,
        paddingHorizontal: 12
    },
    row: {
        marginBottom: 12,
        alignItems: "center",
    },
});