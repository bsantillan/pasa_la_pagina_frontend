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
      <View style={styles.buttonOverlay}>
        <PrimaryButton
          title="Cerrar"
          onPress={onClose}
          styleBtn={styles.styleBtn}
          styleTxt={styles.textBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  buttonOverlay: {
    position: "absolute",
    bottom: 40,       
    left: 16,         
    right: 16,        
    alignItems: "center",
  },
  styleBtn: {
    paddingHorizontal: 16,
    width: "100%",
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    margin: 16,
  },
  textBtn: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
