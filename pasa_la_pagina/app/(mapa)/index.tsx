import { Colors } from "@/constants/Colors";
import { Publicacion, usePublicacion } from "@/contexts/PublicacionContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = 120;
const CARD_HEIGHT_SELECTED = 130;
const SPACING = 16;

/* ---------------------------
   CARD MEMOIZADA
--------------------------- */
const PublicacionCard = React.memo(
    function PublicacionCard({
        item,
        isSelected,
        onPress,
    }: {
        item: Publicacion;
        isSelected: boolean;
        onPress: () => void;
    }) {
        const imageUrl =
            item.fotos_url?.[0] || "https://via.placeholder.com/150x150?text=Sin+imagen";

        const getDescripcion = () => {
            const partes: string[] = [];
            if (item.tipo) partes.push(item.tipo === "apunte" ? "Apunte" : "Libro");
            if (item.nuevo) partes.push("nuevo");
            if (item.digital) partes.push("digital");
            else partes.push("en físico");
            partes.push(`para ${item.tipo_oferta}`);
            return partes.join(" ");
        };

        return (
            <TouchableOpacity
                activeOpacity={0.95}
                onPress={onPress}
                style={[
                    styles.card,
                    isSelected && styles.cardSelected,
                    { height: isSelected ? CARD_HEIGHT_SELECTED : CARD_HEIGHT },
                ]}
            >
                <Image source={{ uri: imageUrl }} style={styles.cardImage} />

                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.titulo}
                    </Text>

                    <Text style={styles.cardDescription} numberOfLines={2}>
                        {getDescripcion()}
                    </Text>

                    {item.precio && item.precio > 0 ? (
                        <Text style={styles.price}>${item.precio.toLocaleString()}</Text>
                    ) : (
                        <Text style={styles.priceGratis}>Gratis</Text>
                    )}

                    <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() =>
                            router.push(`/(tabs)/visualizarPublicacion?id=${item.id}`)
                        }
                    >
                        <Text style={styles.viewButtonText}>Ver publicación</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    },
    (prev, next) =>
        prev.item.id === next.item.id &&
        prev.isSelected === next.isSelected
);

/* --------------------------- */

export default function MapaPublicaciones() {
    const { publicaciones, loading, error, getUserLocation, limpiarFiltros } = usePublicacion();
    const markerImages = {
        apunte: {
            normal: require("../../assets/images/Market-Apunte-No-Seleccionado.png"),
            selected: require("../../assets/images/Market-Apunte-Seleccionado.png"),
        },
        libro: {
            normal: require("../../assets/images/Market-Libro-No-Seleccionado.png"),
            selected: require("../../assets/images/Market-Libro-Seleccionado.png"),
        },
    };

    const mapRef = useRef<MapView>(null);
    const flatListRef = useRef<FlatList<Publicacion>>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [initialRegion, setInitialRegion] = useState<Region | null>(null);

    useEffect(() => {
        return () => {
            limpiarFiltros("mapa");
        };
    }, []);


    /* ------------------------
        UBICACIÓN INICIAL
    ------------------------ */
    useEffect(() => {
        const getInitialRegion = async () => {
            const loc = await getUserLocation();

            if (loc) {
                setInitialRegion({
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            } else if (publicaciones.length > 0) {
                const first = publicaciones[0];
                setInitialRegion({
                    latitude: first.latitud!,
                    longitude: first.longitud!,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            }
        };
        getInitialRegion();
    }, []);

    /* ------------------------
        ANIMAR HACIA MARCADOR
    ------------------------ */
    const animateToMarker = useCallback(
        (index: number) => {
            const pub = publicaciones[index];
            if (!pub) return;

            mapRef.current?.animateToRegion(
                {
                    latitude: pub.latitud!,
                    longitude: pub.longitud!,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                },
                350
            );
        },
        [publicaciones]
    );

    /* ------------------------
        SELECT MARCADOR SEGURO
    ------------------------ */
    const onMarkerPress = (index: number) => {
        setSelectedIndex(index);

        flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
        });

        setTimeout(() => {
            animateToMarker(index);
        }, 0);
    };

    /* ------------------------
        MANEJAR SCROLL
    ------------------------ */
    const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = e.nativeEvent.contentOffset.x;
        const index = Math.round(x / (CARD_WIDTH + SPACING));

        if (index !== selectedIndex && index >= 0 && index < publicaciones.length) {
            setSelectedIndex(index);
            animateToMarker(index);
        }
    };

    /* ------------------------
        ESTADOS VISUALES
    ------------------------ */

    if (loading)
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Cargando publicaciones...</Text>
            </View>
        );

    if (error)
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="alert-circle" size={48} color={Colors.cta} />
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );

    if (publicaciones.length === 0)
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="map-outline" size={48} color={Colors.disabled_primary} />
                <Text style={styles.emptyText}>No hay publicaciones con ubicación</Text>
            </View>
        );

    if (!initialRegion)
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
            </View>
        );

    /* ------------------------
        UI PRINCIPAL
    ------------------------ */

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={initialRegion}
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass={false}
            >
                {publicaciones.map((pub, index) => {
                    const isSelected = selectedIndex === index;
                    const tipo = pub.tipo === "apunte" ? "apunte" : "libro";

                    return (
                        <Marker
                            key={`${pub.id}-${isSelected}`}
                            coordinate={{
                                latitude: pub.latitud!,
                                longitude: pub.longitud!,
                            }}
                            image={
                                isSelected
                                    ? markerImages[tipo].selected
                                    : markerImages[tipo].normal
                            }
                            onPress={() => onMarkerPress(index)}
                            anchor={{ x: 0.5, y: 1 }}
                        />
                    );
                })}
            </MapView>

            {/* BOTÓN UBICACIÓN */}
            <TouchableOpacity
                style={styles.locationButton}
                onPress={async () => {
                    const loc = await getUserLocation();
                    if (loc) {
                        mapRef.current?.animateToRegion(
                            {
                                latitude: loc.latitude,
                                longitude: loc.longitude,
                                latitudeDelta: 0.015,
                                longitudeDelta: 0.015,
                            },
                            500
                        );
                    }
                }}
            >
                <Ionicons name="locate" size={24} color={Colors.primary} />
            </TouchableOpacity>

            {/* CARRUSEL */}
            <View style={styles.carouselContainer}>
                <FlatList
                    ref={flatListRef}
                    data={publicaciones}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => (
                        <PublicacionCard
                            item={item}
                            isSelected={selectedIndex === index}
                            onPress={() => onMarkerPress(index)}
                        />
                    )}
                    horizontal
                    snapToInterval={CARD_WIDTH + SPACING}
                    decelerationRate="fast"
                    onMomentumScrollEnd={onScrollEnd}
                    onScrollToIndexFailed={(info) => {
                        setTimeout(() => {
                            flatListRef.current?.scrollToIndex({
                                index: info.index,
                                animated: true,
                                viewPosition: 0.5,
                            });
                        }, 100);
                    }}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: (width - CARD_WIDTH) / 2,
                        paddingVertical: 16,
                    }}
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    removeClippedSubviews={false}
                />
            </View>
        </View>
    );
}

/* ------------------------
    ESTILOS
------------------------ */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    map: { ...StyleSheet.absoluteFillObject },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: { marginTop: 12, fontSize: 16, color: Colors.text },
    errorText: { marginTop: 12, fontSize: 16, color: Colors.cta, textAlign: "center" },
    emptyText: { marginTop: 12, fontSize: 16, color: Colors.disabled_primary },
    /* CARRUSEL */
    carouselContainer: {
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
    },
    /* CARDS */
    card: {
        width: CARD_WIDTH,
        marginHorizontal: SPACING / 2,
        backgroundColor: Colors.white,
        borderRadius: 16,
        flexDirection: "row",
        elevation: 4,
    },
    cardSelected: {
        borderWidth: 2,
        borderColor: 'transparent',
    },
    cardImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
        margin: 4,
    },
    cardContent: { flex: 1, paddingVertical: 12, paddingHorizontal: 8 },
    cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.text },
    cardDescription: { fontSize: 13, color: "#666" },
    price: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.cta,
    },
    priceGratis: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.cta,
    },
    viewButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: "flex-start",
    },
    viewButtonText: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: "600",
    },
    locationButton: {
        position: "absolute",
        top: 20,
        right: 20,
        backgroundColor: Colors.white,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
    },
});