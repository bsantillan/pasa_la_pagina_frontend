// FilterModal.tsx
import { usePublicacion } from "@/contexts/PublicacionContext";
import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import Slider from "@react-native-community/slider";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function FilterModal({ visible, onClose }: FilterModalProps) {
  const { filtros, setFiltros, aplicarFiltros, limpiarFiltros } =
    usePublicacion();
  const [activeTab, setActiveTab] = useState<
    "general" | "material" | "cercania"
  >("general");

  if (!visible) return null;

  const handleApply = () => {
    aplicarFiltros(0); // Reiniciar a página 0
    onClose();
  };

  const handleClear = () => {
    limpiarFiltros();
    onClose();
  };

  // Funciones específicas para cada tipo de filtro
  const handleToggleOferta = (oferta: "Venta" | "Intercambio" | "Donación") => {
    const current = filtros.tipos_oferta || [];
    if (current.includes(oferta)) {
      setFiltros({
        ...filtros,
        tipos_oferta: current.filter((o) => o !== oferta),
      });
    } else {
      setFiltros({
        ...filtros,
        tipos_oferta: [...current, oferta],
      });
    }
  };

  const handleToggleMaterial = (material: "Libro" | "Apunte") => {
    const current = filtros.tipos_material || [];
    if (current.includes(material)) {
      setFiltros({
        ...filtros,
        tipos_material: current.filter((m) => m !== material),
      });
    } else {
      setFiltros({
        ...filtros,
        tipos_material: [...current, material],
      });
    }
  };

  const handleToggleNivel = (nivel: "Primaria" | "Secundaria" | "Superior") => {
    const current = filtros.niveles_educativos || [];
    if (current.includes(nivel)) {
      setFiltros({
        ...filtros,
        niveles_educativos: current.filter((n) => n !== nivel),
      });
    } else {
      setFiltros({
        ...filtros,
        niveles_educativos: [...current, nivel],
      });
    }
  };

  const handleToggleIdioma = (
    idioma: "Español" | "Inglés" | "Francés" | "Alemán"
  ) => {
    const current = filtros.idiomas || [];
    if (current.includes(idioma)) {
      setFiltros({
        ...filtros,
        idiomas: current.filter((i) => i !== idioma),
      });
    } else {
      setFiltros({
        ...filtros,
        idiomas: [...current, idioma],
      });
    }
  };
  const tabs = [
    { label: "General", value: "general" },
    { label: "Material", value: "material" },
    { label: "Cercanía", value: "cercania" },
  ];

  const renderGeneralTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Oferta</Text>
      <View style={styles.buttonRow}>
        {["Venta", "Intercambio", "Donación"].map((oferta) => (
          <TouchableOpacity
            key={oferta}
            style={[
              styles.filterButton,
              filtros.tipos_oferta?.includes(oferta) &&
                styles.filterButtonActive,
            ]}
            onPress={() => handleToggleOferta(oferta as any)}
          >
            <Text style={[styles.filterButtonText, filtros.tipos_oferta?.includes(oferta) && styles.fileterButtonTextActive]}>{oferta}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Nuevo</Text>
      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[styles.switch, filtros.nuevo === true && styles.switchOn]}
          onPress={() => setFiltros({ ...filtros, nuevo: true })}
        >
          <Text style={[styles.switchText, filtros.nuevo === true && styles.fileterButtonTextActive]}>Sí</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switch, filtros.nuevo === false && styles.switchOn]}
          onPress={() => setFiltros({ ...filtros, nuevo: false })}
        >
          <Text style={[styles.switchText, filtros.nuevo === false && styles.fileterButtonTextActive]}>No</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Digital</Text>
      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[styles.switch, filtros.digital === true && styles.switchOn]}
          onPress={() => setFiltros({ ...filtros, digital: true })}
        >
          <Text style={[styles.switchText, filtros.digital === true && styles.fileterButtonTextActive]}>Sí</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switch, filtros.digital === false && styles.switchOn]}
          onPress={() => setFiltros({ ...filtros, digital: false })}
        >
          <Text style={[styles.switchText, filtros.digital === true && styles.fileterButtonTextActive]}>No</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Precio</Text>
      <View style={styles.priceRow}>
        <TextInput
          style={styles.priceInput}
          placeholder="Mínimo"
          keyboardType="numeric"
          value={filtros.precio_minimo?.toString() || ""}
          onChangeText={(text) =>
            setFiltros({
              ...filtros,
              precio_minimo: text ? parseFloat(text) : undefined,
            })
          }
        />
        <TextInput
          style={styles.priceInput}
          placeholder="Máximo"
          keyboardType="numeric"
          value={filtros.precio_maximo?.toString() || ""}
          onChangeText={(text) =>
            setFiltros({
              ...filtros,
              precio_maximo: text ? parseFloat(text) : undefined,
            })
          }
        />
      </View>
    </View>
  );

  const renderMaterialTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Tipo de Material</Text>
      <View style={styles.buttonRow}>
        {(["Libro", "Apunte"] as const).map((material) => (
          <TouchableOpacity
            key={material}
            style={[
              styles.filterButton,
              filtros.tipos_material?.includes(material) &&
                styles.filterButtonActive,
            ]}
            onPress={() => handleToggleMaterial(material as any)}
          >
            <Text style={[styles.filterButtonText, filtros.tipos_material?.includes(material) && styles.fileterButtonTextActive]}>{material}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtros.tipos_material?.includes("Apunte") && (
        <>
          <Text style={styles.sectionTitle}>Nivel Educativo</Text>
          <View style={styles.buttonRow}>
            {["Primaria", "Secundaria", "Superior"].map((nivel) => (
              <TouchableOpacity
                key={nivel}
                style={[
                  styles.filterButton,
                  filtros.niveles_educativos?.includes(nivel) &&
                    styles.filterButtonActive,
                ]}
                onPress={() => handleToggleNivel(nivel as any)}
              >
                <Text style={[styles.filterButtonText, filtros.niveles_educativos?.includes(nivel) && styles.fileterButtonTextActive]}>{nivel}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Idioma</Text>
      <View style={styles.buttonRow}>
        {["Español", "Inglés", "Francés", "Alemán"].map((idioma) => (
          <TouchableOpacity
            key={idioma}
            style={[
              styles.filterButton,
              filtros.idiomas?.includes(idioma) && styles.filterButtonActive,
            ]}
            onPress={() => handleToggleIdioma(idioma as any)}
          >
            <Text style={[styles.filterButtonText, filtros.idiomas?.includes(idioma) && styles.fileterButtonTextActive]}>{idioma}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCercaniaTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Distancia máxima</Text>
      <View style={styles.sliderContainer}>
        <Text>1 km</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={100}
          step={1}
          value={filtros.distancia_maxima || 10}
          minimumTrackTintColor="#3C7F72"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#3C7F72"
          onValueChange={(value) =>
            setFiltros({ ...filtros, distancia_maxima: value })
          }
        />
        <Text>{Math.round(filtros.distancia_maxima || 10)} km</Text>
      </View>

      <TouchableOpacity
        style={styles.clearDistanceButton}
        onPress={() => setFiltros({ ...filtros, distancia_maxima: undefined })}
      >
        <Text style={styles.clearDistanceText}>Sin límite de distancia</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filtros</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>X</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            {tabs.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.tabButton,
                  activeTab === value && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab(value as any)}
              >
                <Text style={[styles.tabText, activeTab.includes(value) && styles.fileterButtonTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.scrollView}>
            {activeTab === "general" && renderGeneralTab()}
            {activeTab === "material" && renderMaterialTab()}
            {activeTab === "cercania" && renderCercaniaTab()}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Limpiar filtro</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Ver resultados</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTabButton: {
    backgroundColor: "#3C7F72",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ADBEBB",
  },
  scrollView: {
    padding: 16,
  },
  tabContent: {
    // 👈 Añadido
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#3C7F72",
    borderRadius: 28,
  },
  filterButtonActive: {
    backgroundColor: "#3C7F72",
    borderColor: "#3C7F72",
  },
  filterButtonText: {
    color: "#3C7F72",
  },
  fileterButtonTextActive: {
    color: "#FFFDFD",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  switch: {
    width: 60,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#3C7F72",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  switchOn: {
    backgroundColor: "#3C7F72",
    borderColor: "#3C7F72",
  },
  switchText: {
    color: "#3C7F72",
  },
  priceRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#3C7F72",
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 40,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  clearDistanceButton: {
    backgroundColor: "#3C7F72",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  clearDistanceText: {
    color: "#FFFDFD",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  clearButton: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#3C7F72",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#FFAF00",
    fontWeight: "bold",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#3C7F72",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    marginLeft: 8,
  },
  applyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
