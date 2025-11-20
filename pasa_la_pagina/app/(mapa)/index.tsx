import { Colors } from "@/constants/Colors";
import { usePublicacion } from "@/contexts/PublicacionContext";
import { Publicacion } from "@/types/Publicacion";
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

// Estilo del mapa: natural pero sin POIs comerciales
const mapStyle = [
    // Ocultar POIs comerciales (restaurantes, tiendas, etc)
    {
        featureType: "poi.business",
        stylers: [{ visibility: "off" }],
    },
    {
        featureType: "poi.attraction",
        stylers: [{ visibility: "off" }],
    },
    {
        featureType: "poi.place_of_worship",
        stylers: [{ visibility: "off" }],
    },
    {
        featureType: "poi.school",
        stylers: [{ visibility: "off" }],
    },
    {
        featureType: "poi.medical",
        stylers: [{ visibility: "off" }],
    },
    {
        featureType: "poi.government",
        stylers: [{ visibility: "off" }],
    },
    {
        featureType: "poi.sports_complex",
        stylers: [{ visibility: "off" }],
    },
    // Mantener parques y áreas verdes
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ visibility: "on" }, { color: "#c8e6c9" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels",
        stylers: [{ visibility: "on" }],
    },
    // Agua visible
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ visibility: "on" }, { color: "#b3e5fc" }],
    },
    {
        featureType: "water",
        elementType: "labels.text",
        stylers: [{ visibility: "on" }],
    },
    // Calles normales
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ visibility: "on" }],
    },
    {
        featureType: "road",
        elementType: "labels",
        stylers: [{ visibility: "on" }],
    },
    // Transito visible pero sutil
    {
        featureType: "transit.station",
        stylers: [{ visibility: "off" }],
    },
    // Ocultar iconos de POIs
    {
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }],
    },
];

// Marker personalizado
const CustomMarker = ({ isSelected, tipo }: { isSelected: boolean; tipo: string }) => (
    <View style={styles.markerContainer}>
        <View
            style={[
                styles.marker,
                { backgroundColor: isSelected ? Colors.cta : Colors.primary },
            ]}
        >
            <Ionicons
                name={tipo === "apunte" ? "document-text" : "book"}
                size={14}
                color={Colors.white}
            />
        </View>
        <View
            style={[
                styles.markerArrow,
                { borderTopColor: isSelected ? Colors.cta : Colors.primary },
            ]}
        />
    </View>
);

// Tarjeta de publicación estilo imagen
const PublicacionCard = ({
    item,
    isSelected,
    onPress,
}: {
    item: Publicacion;
    isSelected: boolean;
    onPress: () => void;
}) => {
    const imageUrl = item.fotos_url?.[0] || "https://via.placeholder.com/150x150?text=Sin+imagen";

    // Generar descripción corta
    const getDescripcion = () => {
        const partes: string[] = [];
        partes.push(item.tipo_material);
        if (item.nuevo) partes.push("nuevo");
        if (item.digital) partes.push("digital");
        else partes.push("en físico");
        if (item.tipo_oferta) partes.push(`para ${item.tipo_oferta.toLowerCase()}`);
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
                    onPress={() => router.push(`/(tabs)/visualizarPublicacion?id=${item.id}`)}
                >
                    <Text style={styles.viewButtonText}>Ver publicación</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export default function MapaPublicaciones() {
    const { publicaciones, loading, error, getUserLocation } = usePublicacion();
    const mapRef = useRef<MapView>(null);
    const flatListRef = useRef<FlatList<Publicacion>>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [initialRegion, setInitialRegion] = useState<Region | null>(null);

    // Filtrar publicaciones con coordenadas válidas
    const publicacionesConUbicacion = publicaciones.filter(
        (p) => p.latitud != null && p.longitud != null
    );

    // Obtener ubicación inicial
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
            } else if (publicacionesConUbicacion.length > 0) {
                const first = publicacionesConUbicacion[0];
                setInitialRegion({
                    latitude: first.latitud!,
                    longitude: first.longitud!,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            }
        };
        getInitialRegion();
    }, [publicacionesConUbicacion]);

    const goToUserLocation = useCallback(async () => {
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
    }, [getUserLocation]);

    const animateToMarker = useCallback(
        (index: number) => {
            if (publicacionesConUbicacion[index]) {
                const pub = publicacionesConUbicacion[index];
                mapRef.current?.animateToRegion(
                    {
                        latitude: pub.latitud!,
                        longitude: pub.longitud!,
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.015,
                    },
                    350
                );
            }
        },
        [publicacionesConUbicacion]
    );

    const onMarkerPress = useCallback(
        (index: number) => {
            setSelectedIndex(index);
            flatListRef.current?.scrollToIndex({
                index,
                animated: true,
                viewPosition: 0.5,
            });
            animateToMarker(index);
        },
        [animateToMarker]
    );

    const onScrollEnd = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            const x = e.nativeEvent.contentOffset.x;
            const index = Math.round(x / (CARD_WIDTH + SPACING));
            if (index !== selectedIndex && index >= 0 && index < publicacionesConUbicacion.length) {
                setSelectedIndex(index);
                animateToMarker(index);
            }
        },
        [selectedIndex, animateToMarker, publicacionesConUbicacion.length]
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Cargando publicaciones...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="alert-circle" size={48} color={Colors.cta} />
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    if (publicacionesConUbicacion.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="map-outline" size={48} color={Colors.disabled_primary} />
                <Text style={styles.emptyText}>No hay publicaciones con ubicación</Text>
            </View>
        );
    }

    if (!initialRegion) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={initialRegion}
                customMapStyle={mapStyle}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={false}
                showsBuildings={false}
                showsTraffic={false}
                showsIndoors={false}
            >
                {publicacionesConUbicacion.map((pub, index) => (
                    <Marker
                        key={pub.id}
                        coordinate={{ latitude: pub.latitud!, longitude: pub.longitud! }}
                        onPress={() => onMarkerPress(index)}
                        anchor={{ x: 0.5, y: 1 }}
                    >
                        <CustomMarker
                            isSelected={selectedIndex === index}
                            tipo={pub.tipo_material === "Apunte" ? "apunte" : "libro"}
                        />
                    </Marker>
                ))}
            </MapView>
            {/* Botón ubicación del usuario */}
            <TouchableOpacity
                style={styles.locationButton}
                onPress={goToUserLocation}
                activeOpacity={0.8}
            >
                <Ionicons name="locate" size={24} color={Colors.primary} />
            </TouchableOpacity>

            {/* Carrusel inferior */}
            <View style={styles.carouselContainer}>
                <FlatList
                    ref={flatListRef}
                    data={publicacionesConUbicacion}
                    renderItem={({ item, index }) => (
                        <PublicacionCard
                            item={item}
                            isSelected={selectedIndex === index}
                            onPress={() => onMarkerPress(index)}
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={CARD_WIDTH + SPACING}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    contentContainerStyle={styles.carouselContent}
                    onMomentumScrollEnd={onScrollEnd}
                    getItemLayout={(_, index) => ({
                        length: CARD_WIDTH + SPACING,
                        offset: (CARD_WIDTH + SPACING) * index,
                        index,
                    })}
                    ItemSeparatorComponent={() => <View style={{ width: 0 }} />}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    map: { ...StyleSheet.absoluteFillObject },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.background,
        padding: 20,
    },
    loadingText: { marginTop: 12, fontSize: 16, color: Colors.text },
    errorText: { marginTop: 12, fontSize: 16, color: Colors.cta, textAlign: "center" },
    emptyText: { marginTop: 12, fontSize: 16, color: Colors.disabled_primary },

    // Markers
    markerContainer: {
        alignItems: "center",
    },
    marker: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: Colors.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    markerArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        marginTop: -2,
    },

    // Carrusel
    carouselContainer: {
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
    },
    carouselContent: {
        paddingHorizontal: (width - CARD_WIDTH) / 2,
        paddingVertical: 16,
    },

    // Tarjetas
    card: {
        width: CARD_WIDTH,
        marginHorizontal: SPACING / 2,
        backgroundColor: Colors.white,
        borderRadius: 16,
        flexDirection: "row",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
        overflow: "hidden",
    },
    cardSelected: {
        borderWidth: 2,
        borderColor: 'transparent',
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    cardImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
        margin: 4,
        resizeMode: "cover",
    },
    cardContent: {
        flex: 1,
        paddingVertical: 12,
        paddingRight: 4,
        paddingLeft: 4,
        justifyContent: "space-between",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.text,
    },
    cardDescription: {
        fontSize: 13,
        color: "#666",
        lineHeight: 18,
    },
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
});