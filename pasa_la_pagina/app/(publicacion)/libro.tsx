import PrimaryButton from "@/components/ui/Boton/Primary";
import ISBNScanner from "@/components/ui/ISBNScanner";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicacion } from "@/contexts/PublicacionContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LibroScreen() {
  // Steps
  const [step, setStep] = useState(1);
  const [showScanner, setShowScanner] = useState(false);
  const { libro, updateLibro } = usePublicacion();
  const [idiomas, setIdiomas] = useState<{ value: string; label: string }[]>(
    []
  );
  const { getValidAccessToken } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchIdiomas = async () => {
      try {
        const access = await getValidAccessToken();
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}enums/idiomas`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${access}`,
            },
          }
        );
        const data = await res.json();
        setIdiomas(
          data.map((item: { nombre: string }) => ({
            value: item.nombre,
            label: item.nombre,
          }))
        );
      } catch (err) {
        console.error(err);
        Alert.alert("Error fetching idiomas", String(err));
      }
    };
    fetchIdiomas();
  }, []);
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };
  // Fetch a Google Books API
  const fetchBookData = async (isbn: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
      );
      const data = await res.json();
      const bookKey = `ISBN:${isbn}`;
      const book = data[bookKey];

      if (book) {
        updateLibro({
          titulo: book.title || "",
          autor: book.authors?.map((a: any) => a.name).join(", ") || "",
          editorial: book.publishers?.map((p: any) => p.name).join(", ") || "",
          sinopsis: book.excerpts?.[0]?.text || "",
        });
      } else {
        Alert.alert("No se encontró información para este ISBN");
        setStep(2);
      }
      setStep(2);
    } catch (err) {
      console.error(err);
      Alert.alert("Error buscando libro", String(err));
      updateLibro({ isbn: parseInt(isbn) });
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // --- Render de cada step ---
  const renderStep = () => {
    // Dentro del renderStep o en el return del step 2
    const isStep2Complete = () => {
      return (
        libro.titulo?.trim() &&
        libro.autor?.trim() &&
        libro.editorial?.trim() &&
        libro.sinopsis?.trim()
      );
    };

    switch (step) {
      case 1:
        return (
          <View style={{ marginTop: 120 }}>
            <Text style={styles.title}>Ingresar código ISBN</Text>
            <Text style={styles.subtitle}>
              El ISBN es el código único de tu libro. Podés encontrarlo en la
              contratapa o en la página de créditos.
            </Text>
            <Text style={styles.label}>Código</Text>
            <TextInput
              value={String(libro.isbn || "")}
              onChangeText={(num) => updateLibro({ isbn: parseInt(num) })}
              placeholder="Ingresá ISBN"
              style={styles.input_isbn}
            />
            <View style={styles.view_isbn}>
              <PrimaryButton
                styleBtn={styles.styleBtn}
                title="Escanear código"
                onPress={() => setShowScanner(true)}
                disabled={loading}
              />
              <PrimaryButton
                styleBtn={styles.styleBtn}
                title={loading ? "Cargando..." : "Buscar por ISBN"}
                onPress={() => fetchBookData(String(libro.isbn))}
                disabled={loading || !libro.isbn}
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.title}>Revisar y completar la información</Text>
            <Text style={styles.subtitle}>
              Trajimos automáticamente los datos de tu libro a partir del ISBN.
              Revisalos y completá la información que falte.
            </Text>
            <Text style={styles.label}>Título</Text>
            <TextInput
              value={libro.titulo}
              onChangeText={(text) => updateLibro({ titulo: text })}
              placeholder="Título"
              style={styles.input}
            />
            <Text style={styles.label}>Autor</Text>
            <TextInput
              value={libro.autor}
              onChangeText={(text) => updateLibro({ autor: text })}
              placeholder="Autor"
              style={styles.input}
            />
            <Text style={styles.label}>Editorial</Text>
            <TextInput
              value={libro.editorial}
              onChangeText={(text) => updateLibro({ editorial: text })}
              placeholder="Editorial"
              style={styles.input}
            />
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.title}>Revisar y completar la información</Text>
            <Text style={styles.subtitle}>
              Trajimos automáticamente los datos de tu libro a partir del ISBN.
              Revisalos y completá la información que falte.
            </Text>
            <Text style={styles.label}>Idioma</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={libro.idioma}
                onValueChange={(value) => updateLibro({ idioma: value })}
                style={styles.picker}
              >
                {idiomas.map((lang) => (
                  <Picker.Item
                    key={lang.value}
                    label={lang.label}
                    value={lang.value}
                  />
                ))}
              </Picker>
            </View>
            <Text style={styles.label}>Genero</Text>
            <TextInput
              value={libro.genero}
              onChangeText={(text) => updateLibro({ genero: text })}
              placeholder="Genero"
              style={styles.input}
            />
            <Text style={styles.label}>Formato</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={libro.digital}
                onValueChange={(value) => updateLibro({ digital: value })}
                style={styles.picker}
              >
                <Picker.Item label="Físico" value={false} />
                <Picker.Item label="Digital" value={true} />
              </Picker>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={(event) => handleBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear publicación</Text>
        <View style={{ width: 40 }} />
      </View>
      {renderStep()}

      {/* Navegación de steps */}
      {step === 2 && (
        <PrimaryButton
          styleBtn={{ height: 36 }}
          title="Siguiente"
          onPress={() => setStep(step + 1)}
        />
      )}
      {step === 3 && (
        <PrimaryButton
          styleBtn={{ marginTop: 26, height: 36 }}
          title="Siguiente"
          onPress={() => router.push("/(publicacion)/publicacion")}
        />
      )}

      {/* Modal cámara */}
      <Modal visible={showScanner} animationType="slide">
        <ISBNScanner
          onScanned={(data) => {
            updateLibro({ isbn: parseInt(data) });
            fetchBookData(data);
          }}
          onClose={() => setShowScanner(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  input_isbn: {
    borderWidth: 1,
    marginBottom: 65,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    height: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    marginTop: 30,
    marginBottom: 65,
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

  nav: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  title: {
    fontSize: 25,
    fontWeight: 600,
    marginBottom: 10,
    height: 35,
    color: "#000000",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 400,
    marginBottom: 32,
    color: "#838589",
    height: 35,
  },
  label: {
    fontSize: 14,
    fontWeight: 400,
    color: "#0C1A30",
    marginBottom: 6,
  },
  view_isbn: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 16,
    gap: 10,
  },
  styleBtn: {
    flex: 1,
    paddingHorizontal: 16,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  styleTxt: {
    textAlign: "center",
    fontSize: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderColor: "#000000",
    marginBottom: 30,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#000000",
    marginBottom: 30,
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
  },
  picker: {},
});
