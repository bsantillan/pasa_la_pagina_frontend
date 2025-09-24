import React, { useState } from "react";
import {
  Text,
  TextInput,
  Image,
  ScrollView,
  Alert,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { usePublicacion } from "@/contexts/PublicacionContext";
import MapView, { Marker } from "react-native-maps";
import { Colors } from "@/constants/Colors";
import { Picker } from "@react-native-picker/picker";
import PrimaryButton from "@/components/ui/Boton/Primary";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/build/Ionicons";

export default function FinalizarPublicacionScreen() {
  const { comunes, updateComunes, libro, apunte, tipo, reset } =
    usePublicacion();

  const { getValidAccessToken } = useAuth();

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [manualLocation, setManualLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [mapVisible, setMapVisible] = useState(true); // Estado para controlar la visibilidad del mapa

  // 📍 Obtener ubicación actual
  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "No se pudo acceder a la ubicación.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    updateComunes({
      latitud: loc.coords.latitude,
      longitud: loc.coords.longitude,
    });
    setManualLocation(null);
  };

  // 📸 Selección de imágenes
  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  // 📤 Subir imágenes a Cloudinary
  const uploadImages = async (): Promise<string[]> => {
    const preset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_NAME ?? "";
    if (!preset || !cloudName) {
      console.warn(
        "Falta EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET o EXPO_PUBLIC_CLOUDINARY_NAME"
      );
    }

    const uploads = await Promise.all(
      images.map(async (uri) => {
        const formData = new FormData();
        formData.append("file", {
          uri,
          type: "image/jpeg",
          name: "photo.jpg",
        } as any);
        formData.append("upload_preset", preset);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();

        if (!data || !data.secure_url) {
          throw new Error(
            data?.error?.message || "Error al subir imagen a Cloudinary"
          );
        }
        return data.secure_url as string;
      })
    );

    return uploads;
  };

  // ✅ Publicar
  const buildLibroPayload = (uploadedUrls: string[]) => {
    const payload: any = {
      titulo: libro?.titulo ?? "",
      descripcion: comunes?.descripcion ?? "",
      nuevo: comunes?.nuevo ?? false,
      digital: libro?.digital ?? false,
      latitud: comunes?.latitud ?? 0,
      longitud: comunes?.longitud ?? 0,
      idioma: libro?.idioma ?? "",
      cantidad: comunes?.cantidad ?? 1,
      tipo_oferta: comunes?.tipo_oferta ?? "Venta",
      usuarioId: comunes?.usuario_id ?? 1,
      fotos_url: uploadedUrls,
      isbn: String(libro?.isbn ?? ""),
      genero: (libro?.genero ?? "").trim(),
      autor: libro?.autor ?? "",
      editorial: libro?.editorial ?? "",
    };

    if (comunes?.tipo_oferta === "Venta") {
      payload.precio = comunes?.precio ?? 1;
    }

    return payload;
  };

  // Construir payload para apunte según DTO backend
  const buildApuntePayload = (uploadedUrls: string[]) => {
    const payload: any =  {
      titulo: apunte?.titulo ?? "",
      descripcion: comunes?.descripcion ?? "",
      nuevo: comunes?.nuevo ?? false,
      digital: apunte?.digital ?? false,
      latitud:
        comunes?.latitud ?? location?.latitude ?? manualLocation?.latitude,
      longitud:
        comunes?.longitud ?? location?.longitude ?? manualLocation?.longitude,
      idioma: apunte?.idioma ?? "",
      precio: comunes?.precio ?? 0,
      cantidad: comunes?.cantidad ?? 1,
      anio_elaboracion: apunte?.anio_elaboracion ?? new Date().getFullYear(),
      tipo_oferta: comunes?.tipo_oferta ?? "Venta",
      fotos_url: uploadedUrls,
      usuarioId: comunes?.usuario_id ?? 1,
      cantidad_paginas: apunte?.paginas ?? 1,
      materia: apunte?.materia ?? "",
      institucion: apunte?.institucion ?? "",
      nivel_educativo: apunte?.nivel_educativo ?? "", // verificar valores del enum en backend
      seccion: apunte?.seccion ?? "",
      carrera: apunte?.carrera ?? null,
    };
    if (comunes?.tipo_oferta === "Venta") {
      payload.precio = comunes?.precio ?? 1;
    }

    return payload;
  };

  const handleSubmit = async () => {
    if (!images.length) {
      Alert.alert("Error", "Debes seleccionar al menos una imagen.");
      return;
    }
    if (!location && !manualLocation) {
      Alert.alert("Error", "Debes seleccionar una ubicación.");
      return;
    }
    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      Alert.alert("Error", "No estás autenticado.");
      router.replace("/login");
    }
    const mers = await fetch(`${process.env.EXPO_PUBLIC_API_URL}user/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!mers.ok) {
      Alert.alert("Error", "No se pudo obtener el usuario actual.");
      router.replace("/login");
      return;
    }
    const me = await mers.json();
    updateComunes({ usuario_id: me.id });

    try {
      const uploadedUrls = await uploadImages();

      // armar payload segun tipo
      let payload: any;
      let endpoint = `${process.env.EXPO_PUBLIC_API_URL}publicacion/nuevo`;
      if (tipo === "libro") {
        payload = buildLibroPayload(uploadedUrls);
        endpoint = `${process.env.EXPO_PUBLIC_API_URL}publicacion/nuevo/libro`;
      } else if (tipo === "apunte") {
        payload = buildApuntePayload(uploadedUrls);
        endpoint = `${process.env.EXPO_PUBLIC_API_URL}publicacion/nuevo/apunte`;
      } else {
        throw new Error("Tipo de publicación inválido");
      }


      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Error ${response.status}: ${body}`);
      }

      Alert.alert("Éxito", "La publicación fue creada correctamente");
      reset();
      const publicacion = await response.json();
      router.replace(`/(publicacion)/final?id=${publicacion.id}`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Ocurrió un error al crear la publicación.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear publicación</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Agregar detalles de la publicación</Text>
        <Text style={styles.subtitle}>
          Sumá información específica sobre tu publicación.
        </Text>

        {/* Descripción */}
        <Text style={styles.label}>Descripción:</Text>
        <TextInput
          style={styles.input}
          value={comunes.descripcion || ""}
          onChangeText={(text) => updateComunes({ descripcion: text })}
        />

        {/* Tipo oferta */}
        <Text style={styles.label}>Tipo de Oferta:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            style={styles.picker}
            selectedValue={comunes.tipo_oferta || ""}
            onValueChange={(itemValue) =>
              updateComunes({ tipo_oferta: itemValue })
            }
          >
            <Picker.Item label="Seleccione un tipo de oferta" value="" />
            <Picker.Item label="Venta" value="Venta" />
            <Picker.Item label="Intercambio" value="Intercambio" />
            <Picker.Item label="Donación" value="Donacion" />
          </Picker>
        </View>

        {/* Precio */}
        {comunes.tipo_oferta === "Venta" && (
          <>
            <Text style={styles.label}>Precio:</Text>
            <TextInput
              keyboardType="numeric"
              style={styles.input}
              value={comunes.precio?.toString() || ""}
              onChangeText={(text) => {
                const val = parseFloat(text);
                updateComunes({ precio: isNaN(val) ? undefined : val });
              }}
            />
          </>
        )}

        {/* Cantidad */}
        <Text style={styles.label}>Cantidad:</Text>
        <TextInput
          keyboardType="numeric"
          style={styles.input}
          value={comunes.cantidad?.toString() || ""}
          onChangeText={(text) => {
            const val = parseInt(text, 10);
            updateComunes({ cantidad: isNaN(val) ? undefined : val });
          }}
        />

        {/* Subir fotos */}
        <PrimaryButton title="Seleccionar Imágenes" onPress={pickImages} />
        <ScrollView horizontal style={{ marginVertical: 10 }}>
          {images.map((uri, idx) => (
            <Image
              key={idx}
              source={{ uri }}
              style={{ width: 100, height: 100, marginRight: 10 }}
            />
          ))}
        </ScrollView>

        {/* Ubicación */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={mapVisible ? "Ocultar Mapa" : "Mostrar Mapa"}
            onPress={() => setMapVisible((prev) => !prev)}
          />
          <PrimaryButton
            title="Usar mi ubicación actual"
            onPress={getCurrentLocation}
          />
        </View>
        <Text style={styles.label}>
          Si no queres usar tu ubicacion actual, selecciona la ubicación en el
          mapa:
        </Text>
        {mapVisible && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: -34.9214,
              longitude: -57.9544,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setManualLocation({ latitude, longitude });
              updateComunes({ latitud: latitude, longitud: longitude });
              setLocation(null);
            }}
          >
            {location && <Marker coordinate={location} />}
            {manualLocation && <Marker coordinate={manualLocation} />}
          </MapView>
        )}

        {/* Publicar */}
        <PrimaryButton title="Publicar" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: Colors.background,
    flexGrow: 1,
  },
  container: {
    marginTop: 42,
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    marginTop: 20,
    marginBottom: 0,
  },
  backButton: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: 700,
    color: "#000000",
  },
  title: {
    fontSize: 25,
    fontWeight: 600,
    marginBottom: 10,
    textAlign: "left",
    alignSelf: "flex-start",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 400,
    marginBottom: 22,
    textAlign: "left",
    alignSelf: "flex-start",
    color: "#838589",
  },
  input: {
    width: "100%",
    borderColor: "#000000",
    borderWidth: 1,
    borderRadius: 10,
    height: 50,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  pickerWrapper: {
    width: "100%",
    borderColor: "#000000",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 30,
  },
  picker: {
    width: "100%",
    height: 50,
  },
  map: {
    width: "100%",
    height: 300,
    marginVertical: 20,
    borderRadius: 10,
  },
  label: {
    fontSize: 14,
    alignSelf: "flex-start",
    marginBottom: 6,
    fontWeight: 400,
    color: "#0C1A30",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
});
