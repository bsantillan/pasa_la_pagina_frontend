import PrimaryButton from "@/components/ui/Boton/Primary";
import CameraModal from "@/components/ui/CameraModal";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useEnums } from "@/contexts/EnumsContext";
import { usePublicacion } from "@/contexts/PublicacionContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MapView, { Marker } from "react-native-maps";

export default function FinalizarPublicacionScreen() {
  const { tiposOferta, fetchTiposOferta } = useEnums();
  const { comunes, updateComunes, libro, apunte, tipo, reset } = usePublicacion();
  const { getValidAccessToken } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [manualLocation, setManualLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [mapVisible, setMapVisible] = useState(true);
  const [cameraVisible, setCameraVisible] = useState(false);

  useEffect(() => {
    if (!tiposOferta) fetchTiposOferta();
  }, []);

  // 📍 Obtener ubicación actual
  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "No se pudo acceder a la ubicación.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    updateComunes({ latitud: loc.coords.latitude, longitud: loc.coords.longitude });
    setManualLocation(null);
  };

  // 📤 Subir imágenes a Cloudinary
  const uploadImages = async (): Promise<string[]> => {
    const preset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_NAME ?? "";
    if (!preset || !cloudName) {
      console.warn("Falta EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET o EXPO_PUBLIC_CLOUDINARY_NAME");
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

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!data || !data.secure_url) {
          throw new Error(data?.error?.message || "Error al subir imagen a Cloudinary");
        }
        return data.secure_url as string;
      })
    );

    return uploads;
  };

  // ✅ Payloads
  const buildLibroPayload = (uploadedUrls: string[]) => {
    const payload: any = {
      titulo: libro?.titulo ?? "",
      descripcion: comunes?.descripcion ?? "",
      nuevo: comunes?.nuevo ?? false,
      digital: comunes?.digital ?? false,
      url: comunes?.url,
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
    if (comunes?.tipo_oferta === "Venta") payload.precio = comunes?.precio ?? 1;
    return payload;
  };

  const buildApuntePayload = (uploadedUrls: string[]) => {
    const payload: any = {
      titulo: apunte?.titulo ?? "",
      descripcion: comunes?.descripcion ?? "",
      nuevo: comunes?.nuevo ?? false,
      digital: comunes?.digital ?? false,
      url: comunes?.url,
      latitud: comunes?.latitud ?? location?.latitude ?? manualLocation?.latitude,
      longitud: comunes?.longitud ?? location?.longitude ?? manualLocation?.longitude,
      idioma: apunte?.idioma ?? "",
      precio: comunes?.precio ?? null,
      cantidad: comunes?.cantidad ?? 1,
      anio_elaboracion: apunte?.anio_elaboracion ?? new Date().getFullYear(),
      tipo_oferta: comunes?.tipo_oferta ?? "Venta",
      fotos_url: uploadedUrls,
      usuarioId: comunes?.usuario_id ?? 1,
      cantidad_paginas: apunte?.paginas ?? 1,
      materia: apunte?.materia ?? "",
      institucion: apunte?.institucion ?? "",
      nivel_educativo: apunte?.nivel_educativo ?? "",
      seccion: apunte?.seccion ?? "",
      carrera: apunte?.carrera ?? null,
    };
    if (comunes?.tipo_oferta === "Venta") payload.precio = comunes?.precio ?? 1;
    return payload;
  };

  // ✅ Publicar
  const handleSubmit = async () => {
    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        Alert.alert("Error", "No estás autenticado.");
        router.replace("/login");
        return;
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

      const uploadedUrls = await uploadImages();

      let payload: any;
      let endpoint;
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
      router.replace("/(tabs)");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Ocurrió un error al crear la publicación.");
    }
  };

  const handleNextStep = () => {
    // Validaciones

    if (!comunes.tipo_oferta) {
      Alert.alert("Error", "Debes seleccionar un tipo de oferta.");
      return;
    }

    if (comunes.tipo_oferta === "Venta" && (!comunes.precio || comunes.precio <= 0)) {
      Alert.alert("Error", "El precio es obligatorio para ventas.");
      return;
    }

    if ((!comunes.cantidad || comunes.cantidad <= 0) && !comunes.digital) {
      Alert.alert("Error", "Debes ingresar la cantidad ya que el material es de formato fisico.");
      return;
    }

    if (!images.length) {
      Alert.alert("Error", "Debes seleccionar al menos una imagen.");
      return;
    }

    if (!location && !manualLocation) {
      Alert.alert("Error", "Debes seleccionar una ubicación.");
      return;
    }

    // Si pasa todas las validaciones, avanzar al siguiente step
    setStep(2);
  };


  return (
    <KeyboardAwareScrollView
      style={styles.scrollContent}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={100}
      enableAutomaticScroll
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear publicación</Text>
        <View style={{ width: 40 }} />
      </View>

      {step === 1 && (
        <View style={styles.container}>
          <Text style={styles.title}>Agregar detalles de la publicación</Text>
          <Text style={styles.subtitle}>Sumá información específica sobre tu publicación.</Text>

          {/* Tipo oferta */}
          <Text style={styles.label}>Tipo de Oferta:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              style={styles.picker}
              selectedValue={comunes.tipo_oferta || ""}
              onValueChange={(itemValue) => updateComunes({ tipo_oferta: itemValue })}
            >
              <Picker.Item label="Seleccione un tipo de oferta" value="" />
              {tiposOferta?.map((tipo) => (
                <Picker.Item key={tipo} label={tipo} value={tipo} />
              ))}
            </Picker>
          </View>

          {/* Precio */}
          {comunes.tipo_oferta === "Venta" && (
            <>
              <Text style={styles.label}>Precio:</Text>
              <TextInput
                keyboardType="numeric"
                style={styles.input}
                placeholder="Precio"
                value={comunes.precio?.toString() || ""}
                onChangeText={(text) => {
                  const val = parseFloat(text);
                  updateComunes({ precio: isNaN(val) ? undefined : val });
                }}
              />
            </>
          )}

          {/* Cantidad */}
          {!comunes.digital && (
            <>
              <Text style={styles.label}>Cantidad:</Text>
              <TextInput
                keyboardType="numeric"
                style={styles.input}
                placeholder="Cantidad"
                value={comunes.cantidad?.toString() || ""}
                onChangeText={(text) => {
                  const val = parseInt(text, 10);
                  updateComunes({ cantidad: isNaN(val) ? undefined : val });
                }}
              />
            </>
          )}

          <PrimaryButton
            styleBtn={styles.styleBtn}
            title="Sacar foto"
            onPress={() => setCameraVisible(true)}
          />
          <CameraModal
            visible={cameraVisible}
            onClose={() => setCameraVisible(false)}
            onPhotoTaken={(uri) => setImages((prev) => [...prev, uri])}
          />

          {/* Subir fotos */}
          <PrimaryButton
            styleBtn={styles.styleBtn}
            title="Sacar foto"
            onPress={() => setCameraVisible(true)}
          />
          <CameraModal
            visible={cameraVisible}
            onClose={() => setCameraVisible(false)}
            onPhotoTaken={(uri) => setImages((prev) => [...prev, uri])}
          />

          <ScrollView horizontal style={{ marginVertical: 10 }}>
            {images.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={{ width: 100, height: 100, marginRight: 10 }} />
            ))}
          </ScrollView>

          {/* Ubicación */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              styleBtn={styles.styleBtn}
              title={mapVisible ? "Ocultar Mapa" : "Mostrar Mapa"}
              onPress={() => setMapVisible((prev) => !prev)}
            />
            <PrimaryButton styleBtn={styles.styleBtn} title="Ubicación actual" onPress={getCurrentLocation} />
          </View>
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

          {/* CONTINUAR */}
          <PrimaryButton styleBtn={styles.styleBtn} title="Continuar" onPress={handleNextStep} />
        </View>
      )}

      {step === 2 && (
        <View style={styles.container}>
          <Text style={styles.title_material}>{tipo === "libro" ? libro?.titulo : apunte?.titulo}</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 0, marginBottom: 20 }}>
            {images.map((uri, idx) => (
              <Image
                key={idx}
                source={{ uri }}
                style={styles.imagePreview}
              />
            ))}
          </ScrollView>

          {/* --- Comunes --- */}
          <Text style={styles.label}>Descripción: {comunes.descripcion}</Text>

          <Text style={styles.label}>Tipo de Oferta: {comunes.tipo_oferta}</Text>

          {comunes.tipo_oferta === "Venta" && (
            <>
              <Text style={styles.label}>Precio: ${comunes.precio}</Text>
            </>
          )}

          <Text style={styles.label}>Cantidad: {comunes.cantidad}</Text>

          <Text style={styles.label}>Idioma: {tipo === "libro" ? libro?.idioma : apunte?.idioma}</Text>

          <Text style={styles.label}>Formato: {comunes?.digital ? "Digital" : "Físico"}</Text>

          {/* --- Tipo específico --- */}
          {tipo === "libro" ? (
            <>

              <Text style={styles.label}>Autor: {libro?.autor}</Text>

              <Text style={styles.label}>Editorial: {libro?.editorial}</Text>

              <Text style={styles.label}>ISBN: {libro?.isbn}</Text>

              <Text style={styles.label}>Género: {libro?.genero}</Text>
            </>
          ) : (
            <>
              <Text style={styles.label}>Materia: {apunte?.materia}</Text>

              <Text style={styles.label}>Institución: {apunte?.institucion}</Text>

              <Text style={styles.label}>Nivel educativo: {apunte?.nivel_educativo}</Text>

              <Text style={styles.label}>Sección: {apunte?.seccion}</Text>

              <Text style={styles.label}>Carrera: {apunte?.carrera}</Text>

              <Text style={styles.label}>Año de elaboración: {apunte?.anio_elaboracion}</Text>

              <Text style={styles.label}>Cantidad de páginas: {apunte?.paginas}</Text>
            </>
          )}

          {/* --- Ubicación --- */}
          {(location || manualLocation) && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location?.latitude ?? manualLocation?.latitude!,
                longitude: location?.longitude ?? manualLocation?.longitude!,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              <Marker coordinate={location ?? manualLocation!} />
            </MapView>
          )}

          {/* --- Botones --- */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              styleBtn={styles.styleBtn}
              title="Publicar"
              onPress={handleSubmit}
            />
          </View>
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}

// ----------------- STYLES -----------------
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
    fontWeight: "700",
    color: "#000000",
  },
  title: {
    fontSize: 25,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "left",
    alignSelf: "flex-start",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
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
    fontWeight: "400",
    color: "#0C1A30",
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    marginHorizontal: 16,
    gap: 10,
  },
  styleBtn: {
    flex: 1,
    paddingHorizontal: 16,
    width: "100%",
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  title_material: {
    fontSize: 25,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 10,
    textAlign: "left",
    alignSelf: "flex-start",
  },
  imagePreview: {
    width: 250,           // ancho fijo para el carrusel
    height: 250,          // alto fijo
    borderRadius: 10,
    marginRight: 12,
  }

});
