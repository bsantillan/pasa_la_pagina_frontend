import PrimaryButton from "@/components/ui/Boton/Primary";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import CustomInput from "@/components/ui/CustomInput";
import { FotoCarousel } from "@/components/ui/FotosCarousel";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useEnums } from "@/contexts/EnumsContext";
import { usePublicacion } from "@/contexts/PublicacionContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Image,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MapView, { Marker } from "react-native-maps";

const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const steps = ["Información", "Detalles", "Publicación"];
  return (
    <View style={styles.progressWrapper}>
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          return (
            <React.Fragment key={i}>
              <View style={styles.stepItem}>
                <View style={[
                  styles.progressCircle,
                  isCompleted && styles.progressCircleCompleted,
                  isCurrent && styles.progressCircleCurrent,
                ]}>
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  ) : (
                    <Text style={[
                      styles.progressNumber,
                      isCurrent && styles.progressNumberCurrent
                    ]}>{stepNum}</Text>
                  )}
                </View>
                <Text style={[
                  styles.stepLabel,
                  (isCompleted || isCurrent) && styles.stepLabelActive
                ]}>{steps[i]}</Text>
              </View>
              {i < totalSteps - 1 && (
                <View style={styles.lineWrapper}>
                  <View style={[
                    styles.progressLine,
                    isCompleted && styles.progressLineCompleted
                  ]} />
                </View>
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

export default function FinalizarPublicacionScreen() {
  const { tiposOferta, fetchTiposOferta } = useEnums();
  const tipoOptions = (tiposOferta ?? []).map(t => ({
    label: t,
    value: t,
  }));
  const { tipo, libro, apunte, comunes, updateComunes, reset } = usePublicacion();
  const { getValidAccessToken } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [manualLocation, setManualLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -34.9214,
    longitude: -57.9544,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [images, setImages] = useState<string[]>([]);
  const [customAlert, setCustomAlert] = useState<{
    title: string;
    description: string;
    onAccept?: () => void;
  } | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [addressText, setAddressText] = useState<string | null>(null);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);

  const enlaceRef = useRef<TextInput>(null);
  const cantidadRef = useRef<TextInput>(null);
  const precioRef = useRef<TextInput>(null);
  const descripcionRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!tiposOferta) fetchTiposOferta();
  }, []);

  const showCustomAlert = (
    title: string,
    description: string,
    onAccept?: () => void
  ) => {
    setCustomAlert({ title, description, onAccept });
  };

  //  Obtener Ubicacion actual
  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      showCustomAlert("Permiso denegado", "No se pudo acceder a la ubicacion.");
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({});

      // 👇 Actualizar estado de ubicación actual
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });

      // 👇 Actualizar contexto
      updateComunes({
        latitud: loc.coords.latitude,
        longitud: loc.coords.longitude
      });

      // 👇 Limpiar ubicación manual para que no interfiera
      setManualLocation(null);

      Alert.alert("Éxito", "Ubicación actual obtenida correctamente");
    } catch (error) {
      console.error("Error al obtener ubicación actual:", error);
      Alert.alert("Error", "No se pudo obtener la ubicación actual. Inténtalo de nuevo.");
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setShowErrors(false);
    } else {
      router.back();
    }
  };

  const handleCloseAlert = () => {
    const action = customAlert?.onAccept;
    setCustomAlert(null);
    action?.();
  };

  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        const addr = results[0];
        const parts = [];
        if (addr.street) parts.push(addr.street);
        if (addr.streetNumber) parts[0] = `${addr.street} ${addr.streetNumber}`;
        if (addr.city) parts.push(addr.city);
        if (addr.region) parts.push(addr.region);
        setAddressText(parts.join(", ") || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
    } catch (error) {
      setAddressText(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancelar", "Tomar foto", "Elegir de galería", "Elegir de archivos"],
          cancelButtonIndex: 0,
          title: "Agregar imagen",
          message: "Seleccioná cómo querés agregar la imagen",
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickFromCamera();
          else if (buttonIndex === 2) pickFromGallery();
          else if (buttonIndex === 3) pickFromFiles();
        }
      );
    } else {
      setImagePickerVisible(true);
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se necesita acceso a la cámara.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se necesita acceso a la galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const pickFromFiles = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se necesita acceso a los archivos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  //  Subir imgenes a Cloudinary
  const uploadImages = async (): Promise<string[]> => {
    const preset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_NAME ?? "";
    if (!preset || !cloudName) {
      console.warn("Falta EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET o EXPO_PUBLIC_CLOUDINARY_NAME");
    }
    const uploads = await Promise.all(
      images.map(async (uri) => {
        const formData = new FormData();
        formData.append("file", { uri, type: "image/jpeg", name: "photo.jpg" } as any);
        formData.append("upload_preset", preset);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST", body: formData,
        });
        const data = await res.json();
        if (!data?.secure_url) throw new Error(data?.error?.message || "Error al subir imagen");
        return data.secure_url as string;
      })
    );
    return uploads;
  };

  //  Payloads
  const buildLibroPayload = (uploadedUrls: string[], usuarioId: number) => {
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
      usuarioId: usuarioId,
      fotos_url: uploadedUrls,
      isbn: String(libro?.isbn ?? ""),
      genero: (libro?.genero ?? "").trim(),
      autor: libro?.autor ?? "",
      editorial: libro?.editorial ?? "",
    };
    if (comunes?.tipo_oferta === "Venta") payload.precio = comunes?.precio ?? 1;
    return payload;
  };

  const buildApuntePayload = (uploadedUrls: string[], usuarioId: number) => {
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
      usuarioId: usuarioId,
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

  //  Publicar
  const handleSubmit = async () => {
    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        showCustomAlert("Error", "No estas autenticado.", () => {
          router.replace("/login");
        });
        return;
      }
      const mers = await fetch(`${process.env.EXPO_PUBLIC_API_URL}user/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!mers.ok) {
        showCustomAlert("Error", "No se pudo obtener el usuario actual.", () => {
          router.replace("/login");
        });
        return;
      }
      const me = await mers.json();
      updateComunes({ usuario_id: me.id });
      const uploadedUrls = await uploadImages();

      let payload: any;
      let endpoint;
      if (tipo === "libro") {
        payload = buildLibroPayload(uploadedUrls, me.id);
        endpoint = `${process.env.EXPO_PUBLIC_API_URL}publicacion/nuevo/libro`;
      } else if (tipo === "apunte") {
        payload = buildApuntePayload(uploadedUrls, me.id);
        endpoint = `${process.env.EXPO_PUBLIC_API_URL}publicacion/nuevo/apunte`;
      } else {
        throw new Error("Tipo de publicacion invalido");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Error ${response.status}: ${body}`);
      }
      console.log("Publicacion creada con exito");
      showCustomAlert("Exito", "La publicacion fue creada correctamente", () => {
        reset();
        router.replace("/(tabs)");
      });
    } catch (err) {
      console.error(err);
      showCustomAlert("Error", "Ocurri un error al crear la publicacion.");
    }
  };

  const isStep1Complete = () => {
    // Validar URL solo si es digital + donación
    const needsUrl = (comunes.digital && comunes.tipo_oferta === "Donacion");

    // Validar cantidad solo si es físico
    const needsCantidad = !comunes.digital;

    // Validar precio solo si es venta
    const needsPrecio = comunes.tipo_oferta === "Venta";

    return (
      comunes.descripcion?.trim() &&
      comunes.tipo_oferta &&
      (!needsPrecio || (comunes.precio && comunes.precio > 0)) &&
      (!needsCantidad || (comunes.cantidad && comunes.cantidad > 0)) &&
      (!needsUrl || comunes.url?.trim()) &&
      images.length > 0 &&
      (location || manualLocation)
    );
  };

  const handleNextStep = () => isStep1Complete() ? setStep(2) : setShowErrors(true);

  const getInputStyle = (value: string | number | undefined) => {
    const isEmpty = value === undefined || value === "" || (typeof value === "string" && !value.trim());
    return [styles.input, showErrors && isEmpty && styles.inputError];
  };

  const getNextRefAfterEnlace = () => {
    if (comunes.digital === false) return cantidadRef; // físico → cantidad
    if (comunes.tipo_oferta === "Venta") return precioRef; // digital + venta → precio
    return descripcionRef; // si no hay cantidad ni precio → descripción
  };

  return (
    <>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        showsVerticalScrollIndicator={false}
        extraScrollHeight={100}
        enableAutomaticScroll
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear publicacion</Text>
          <View style={{ width: 40 }} />
        </View>

        <ProgressBar
          currentStep={step === 1 ? 3 : 4}
          totalSteps={3}
        />

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Detalles de la publicación</Text>
            <Text style={styles.subtitle}>Completá la información.</Text>

            <Text style={styles.label}>Tipo de Oferta</Text>
            <CustomDropdown
              value={comunes.tipo_oferta}
              onValueChange={(v) => {
                updateComunes({ tipo_oferta: v });
                if (v !== "Venta") {
                  updateComunes({ precio: undefined });
                }
                if (!comunes.digital || !v?.includes("Donaci")) {
                  updateComunes({ url: undefined });
                }
              }}
              options={tipoOptions}
              placeholder="Selecciona un tipo de oferta"
              showErrors={showErrors}
            />

            {/* ENLACE: Solo para formato digital + tipo donación - AHORA AQUÍ DEBAJO DE TIPO DE OFERTA */}
            {comunes.digital === true && comunes.tipo_oferta?.includes("Donaci") && (
              <>
                <Text style={styles.label}>Enlace</Text>
                <CustomInput
                  placeholder="Enlace"
                  value={comunes.url || ""}
                  onChangeText={(t) => updateComunes({ url: t })}
                  showErrors={showErrors}
                  inputRef={enlaceRef}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => {
                    const next = getNextRefAfterEnlace();
                    next?.current?.focus();
                  }}
                />
              </>
            )}

            {/* PRECIO: Solo para tipo de oferta "Venta" */}
            {comunes.tipo_oferta === "Venta" && (
              <>
                <Text style={styles.label}>Precio</Text>
                <CustomInput
                  placeholder="Precio"
                  value={comunes.precio?.toString() || ""}
                  keyboardType="numeric"
                  onChangeText={(t) => updateComunes({ precio: parseFloat(t) || undefined })}
                  showErrors={showErrors}
                  inputRef={precioRef}
                  returnKeyType={comunes.digital ? "next" : "next"}
                  blurOnSubmit={false}
                  onSubmitEditing={() => descripcionRef.current?.focus()}
                />
              </>
            )}

            {/* CANTIDAD: Solo para formato físico */}
            {comunes.digital === false && (
              <>
                <Text style={styles.label}>Cantidad</Text>
                <CustomInput
                  placeholder="Cantidad"
                  value={comunes.cantidad?.toString() || ""}
                  keyboardType="numeric"
                  onChangeText={(t) => updateComunes({ cantidad: parseInt(t, 10) || undefined })}
                  showErrors={showErrors}
                  inputRef={cantidadRef}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => descripcionRef.current?.focus()}
                />
              </>
            )}

            <Text style={styles.label}>Descripción</Text>
            <CustomInput
              placeholder="Descripción"
              value={comunes.descripcion || ""}
              onChangeText={(t) => updateComunes({ descripcion: t })}
              multiline
              minHeight={100}
              maxHeight={250}
              showErrors={showErrors}
              errorMessage="Este campo es obligatorio"
              inputRef={descripcionRef}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />

            <Text style={styles.label}>Imágenes</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={showImageOptions}>
              <Ionicons name="images-outline" size={32} color={Colors.primary} />
              <Text style={styles.imagePickerText}>Seleccionar imágenes</Text>
              <Text style={styles.imagePickerSubtext}>Tocá para elegir desde tu galería</Text>
            </TouchableOpacity>

            {images.length > 0 && (
              <View style={styles.imagesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagesScrollContent}>
                  {images.map((uri, i) => (
                    <View key={i} style={styles.imageWrapper}>
                      <Image source={{ uri }} style={styles.imageThumb} />
                      <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(i)}>
                        <Ionicons name="close-circle" size={24} color="#ff4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            {showErrors && images.length === 0 && <Text style={styles.errorText}>Debes agregar al menos una imagen</Text>}

            <Text style={styles.sectionTitle}>Seleccionar ubicación</Text>
            {addressText && (
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={18} color={Colors.primary} />
                <Text style={styles.locationText}>{addressText}</Text>
              </View>
            )}
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                region={mapRegion}
                onRegionChangeComplete={setMapRegion}
                onPress={(e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  setManualLocation({ latitude, longitude });
                  updateComunes({ latitud: latitude, longitud: longitude });
                  setLocation(null);
                  getAddressFromCoords(latitude, longitude);
                }}
              >
                {location && <Marker coordinate={location} />}
                {manualLocation && <Marker coordinate={manualLocation} />}
              </MapView>
              <TouchableOpacity style={styles.currentLocationBtn} onPress={getCurrentLocation}>
                <Ionicons name="locate" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            {showErrors && !location && !manualLocation && <Text style={styles.errorText}>Debes seleccionar una ubicación</Text>}

            <PrimaryButton styleBtn={styles.continueBtn} title="Continuar" onPress={handleNextStep} />
          </View>
        )}

        {step === 2 && (
          <View style={{ flex: 1 }}>
            <ScrollView style={styles.containerScroll} contentContainerStyle={{ paddingBottom: 40 }}>
              <View>
                {/* TÍTULO */}
                <Text style={{
                  fontSize: 26,
                  fontWeight: "700",
                  marginBottom: 12,
                  color: Colors.primary,
                  textAlign: "center",
                }}>
                  {tipo === "libro" ? libro?.titulo : apunte?.titulo}
                </Text>

                {/* CARRUSEL DE FOTOS */}
                <FotoCarousel fotos={images} mostrarFavorito={false} />

                {/* DESCRIPCIÓN */}
                <Text
                  style={{
                    fontSize: 18,
                    marginTop: 20,
                    marginBottom: 14,
                    paddingHorizontal: 8,
                    fontWeight: "500",
                    color: "#444",
                  }}
                >
                  {comunes.descripcion}
                </Text>
              </View>

              {/* CARD DE DETALLES */}
              <View
                style={{
                  backgroundColor: "white",
                  padding: 20,
                  borderRadius: 20,
                  marginBottom: 24,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Text style={styles.detailLabel}>Descripción: <Text style={styles.detailValue}>{comunes.descripcion}</Text></Text>
                <Text style={styles.detailLabel}>Tipo de Oferta: <Text style={styles.detailValue}>{comunes.tipo_oferta}</Text></Text>
                {comunes.tipo_oferta === "Venta" && <Text style={styles.detailLabel}>Precio: <Text style={styles.detailValue}>${comunes.precio}</Text></Text>}
                <Text style={styles.detailLabel}>Cantidad: <Text style={styles.detailValue}>{comunes.cantidad}</Text></Text>
                <Text style={styles.detailLabel}>Idioma: <Text style={styles.detailValue}>{tipo === "libro" ? libro?.idioma : apunte?.idioma}</Text></Text>
                <Text style={styles.detailLabel}>Formato: <Text style={styles.detailValue}>{comunes?.digital ? "Digital" : "Físico"}</Text></Text>

                {tipo === "libro" ? (
                  <>
                    <Text style={styles.detailLabel}>Autor: <Text style={styles.detailValue}>{libro?.autor}</Text></Text>
                    <Text style={styles.detailLabel}>Editorial: <Text style={styles.detailValue}>{libro?.editorial}</Text></Text>
                    <Text style={styles.detailLabel}>ISBN: <Text style={styles.detailValue}>{libro?.isbn}</Text></Text>
                    <Text style={styles.detailLabel}>Género: <Text style={styles.detailValue}>{libro?.genero}</Text></Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.detailLabel}>Materia: <Text style={styles.detailValue}>{apunte?.materia}</Text></Text>
                    <Text style={styles.detailLabel}>Institución: <Text style={styles.detailValue}>{apunte?.institucion}</Text></Text>
                    <Text style={styles.detailLabel}>Nivel educativo: <Text style={styles.detailValue}>{apunte?.nivel_educativo}</Text></Text>
                    <Text style={styles.detailLabel}>Sección: <Text style={styles.detailValue}>{apunte?.seccion}</Text></Text>
                    <Text style={styles.detailLabel}>Carrera: <Text style={styles.detailValue}>{apunte?.carrera}</Text></Text>
                    <Text style={styles.detailLabel}>Año de elaboración: <Text style={styles.detailValue}>{apunte?.anio_elaboracion}</Text></Text>
                    <Text style={styles.detailLabel}>Cantidad de páginas: <Text style={styles.detailValue}>{apunte?.paginas}</Text></Text>
                  </>
                )}

              </View>

              {/* UBICACIÓN */}
              {(location || manualLocation) && (
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "600",
                      marginBottom: 10,
                      color: Colors.text,
                    }}
                  >
                    Ubicación
                  </Text>

                  {addressText && (
                    <View style={styles.locationInfo}>
                      <Ionicons name="location" size={18} color={Colors.primary} />
                      <Text style={styles.locationText}>{addressText}</Text>
                    </View>
                  )}

                  <MapView
                    style={{
                      width: "100%",
                      height: 250,
                      borderRadius: 12,
                      marginTop: 6,
                    }}
                    initialRegion={{
                      latitude: location?.latitude ?? manualLocation?.latitude!,
                      longitude: location?.longitude ?? manualLocation?.longitude!,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    <Marker coordinate={location ?? manualLocation!} />
                  </MapView>
                </View>
              )}

              {/* BOTÓN */}
              <PrimaryButton
                styleBtn={{ height: 48, marginTop: 20, marginBottom: 36 }}
                title="Publicar"
                onPress={handleSubmit}
              />
            </ScrollView>
          </View>

        )}



        <Modal
          visible={imagePickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setImagePickerVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setImagePickerVisible(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Agregar imagen</Text>
              <Text style={styles.modalSubtitle}>Seleccioná cómo querés agregar la imagen</Text>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => { setImagePickerVisible(false); pickFromCamera(); }}
              >
                <View style={styles.modalOptionIcon}>
                  <Ionicons name="camera" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.modalOptionText}>Tomar foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => { setImagePickerVisible(false); pickFromGallery(); }}
              >
                <View style={styles.modalOptionIcon}>
                  <Ionicons name="images" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.modalOptionText}>Elegir de galería</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => { setImagePickerVisible(false); pickFromFiles(); }}
              >
                <View style={styles.modalOptionIcon}>
                  <Ionicons name="folder" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.modalOptionText}>Elegir de archivos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setImagePickerVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAwareScrollView>
      <Modal
        visible={!!customAlert}
        transparent
        animationType="fade"
        onRequestClose={handleCloseAlert}
      >
        <TouchableOpacity
          style={styles.customAlertOverlay}
          activeOpacity={1}
          onPress={handleCloseAlert}
        >
          <View style={styles.customAlertCard}>
            <Text style={styles.customAlertTitle}>{customAlert?.title}</Text>
            <Text style={styles.customAlertDescription}>
              {customAlert?.description}
            </Text>
            <PrimaryButton
              title="Aceptar"
              onPress={handleCloseAlert}
              styleBtn={styles.customAlertButton}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  /* Contenedores principales */
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },

  /* Header */
  header: { flexDirection: "row", alignItems: "center", height: 56, marginTop: 10 },
  backButton: { width: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "700", color: "#000" },

  /* Step container (form) */
  stepContainer: { marginTop: 8, paddingHorizontal: 16 },

  /* Progress bar */
  progressWrapper: { marginTop: 16, marginBottom: 24, paddingHorizontal: 8 },
  progressContainer: { flexDirection: "row", alignItems: "flex-start", justifyContent: "center" },
  stepItem: { alignItems: "center", width: 80 },
  progressCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressCircleCompleted: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  progressCircleCurrent: { borderColor: Colors.primary, borderWidth: 2, backgroundColor: Colors.background },
  progressNumber: { fontSize: 14, fontWeight: "600", color: "#999" },
  progressNumberCurrent: { color: Colors.primary },
  stepLabel: { fontSize: 11, color: "#999", marginTop: 6, textAlign: "center" },
  stepLabelActive: { color: Colors.primary, fontWeight: "500" },
  lineWrapper: { flex: 1, justifyContent: "center", paddingTop: 4 },
  progressLine: { height: 2, backgroundColor: "#E0E0E0", marginHorizontal: 4, marginTop: 14 },
  progressLineCompleted: { backgroundColor: Colors.primary },

  /* Textos y labels */
  title: { fontSize: 24, fontWeight: "600", marginBottom: 8, color: "#000" },
  subtitle: { fontSize: 14, marginBottom: 24, color: "#838589", lineHeight: 20 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 6, marginTop: 4, color: "#0C1A30" },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 24, marginBottom: 12, color: "#0C1A30" },
  containerScroll: {
    flex: 1,
  },
  /* Inputs */
  input: { borderColor: "#000", borderWidth: 1, borderRadius: 10, height: 50, paddingHorizontal: 16, marginBottom: 16 },
  textArea: { height: 100, textAlignVertical: "top", paddingTop: 12 },
  inputError: { borderColor: "#ff4444", borderWidth: 2, backgroundColor: Colors.background },
  errorText: { color: "#ff4444", fontSize: 12, marginTop: -12, marginBottom: 12, marginLeft: 4 },

  /* Picker */
  pickerWrapper: { borderColor: "#000", borderWidth: 1, borderRadius: 10, marginBottom: 16, height: 50, justifyContent: "center" },
  picker: { height: 50 },

  /* Image picker */
  imagePicker: {
    borderWidth: 2,
    borderColor: "#c8c8c8ff",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fcf8f2ff",
    marginBottom: 12,
  },
  imagePickerText: { fontSize: 14, fontWeight: "600", color: Colors.primary, marginTop: 8 },
  imagePickerSubtext: { fontSize: 12, color: "#999", marginTop: 4 },

  /* Thumbs */
  imagesContainer: { marginTop: 12, marginBottom: 16, overflow: "visible" },
  imagesScrollContent: { paddingTop: 12, paddingBottom: 4, paddingHorizontal: 4 },
  imageWrapper: { position: "relative", marginRight: 16 },
  imageThumb: { width: 100, height: 100, borderRadius: 10 },
  removeImageBtn: { position: "absolute", top: -12, right: -12, backgroundColor: "#fff", borderRadius: 12, zIndex: 10, elevation: 5 },

  /* Map (form) */
  mapContainer: {
    position: "relative",
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 6,
    backgroundColor: Colors.background,
  },
  map: { width: "100%", height: 250, borderRadius: 12, overflow: "hidden" },

  /* Location info */
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  locationText: { fontSize: 13, color: "#333", flex: 1 },
  currentLocationBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    elevation: 4,
  },

  continueBtn: { height: 48, marginTop: 24, marginBottom: 16 },

  /* Modal (image picker) */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#838589",
    textAlign: "center",
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  modalCancelBtn: {
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#838589",
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
  customAlertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  customAlertCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
    alignItems: "center",
  },
  customAlertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 10,
    textAlign: "center",
  },
  customAlertDescription: {
    fontSize: 14,
    color: "#4A4A4A",
    textAlign: "center",
    marginBottom: 16,
  },
  customAlertButton: {
    minWidth: 180,
    height: 38,
  },

  /* Review / VisualizarPublicacion styles */
  titulo: { fontSize: 24, fontWeight: "700", color: Colors.primary, marginBottom: 20 },
  descripcion: { fontSize: 20, color: "#5D5D5D", marginTop: 20, fontWeight: "600" },

  card: {
    borderRadius: 24,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 10,
  },
  textCard: { fontSize: 14, color: "#3C3C43", marginBottom: 4, fontWeight: "500" },

  mapContainerPreview: { marginTop: 24, marginBottom: 12 },
  ubicacionTitle: { fontSize: 20, fontWeight: "600", color: "#000", marginBottom: 12 },
  mapPreview: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  imagesPreviewRow: { marginBottom: 20 },
  imagePreview: { width: 200, height: 200, borderRadius: 12, marginRight: 12 },

  detailsContainer: { gap: 8, marginBottom: 16 },

  /* Labels/values para review */
  detailLabel: { fontSize: 14, color: "#838589", marginTop: 10 },
  detailValue: { fontSize: 16, fontWeight: "600", color: "#000", marginBottom: 4 },
});

