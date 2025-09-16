import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import PrimaryButton from "./Boton/Primary";

type Props = {
  onScanned: (isbn: string) => void;
  onClose: () => void;
};

export default function ISBNScanner({ onScanned, onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View />; // Todavía cargando el estado
  }
  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text>No hay permisos de cámara</Text>
        <PrimaryButton title="Dar permisos" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"], // ISBN suele venir como EAN13
        }}
        onBarcodeScanned={({ data }) => {
          if (!scanned) {
            setScanned(true);
            onScanned(data);
            onClose();
          }
        }}
      />
      <PrimaryButton title="Cerrar" onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
