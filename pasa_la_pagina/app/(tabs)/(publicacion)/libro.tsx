import PrimaryButton from "@/components/ui/Boton/Primary";
import ISBNScanner from "@/components/ui/ISBNScanner";
import { Colors } from "@/constants/Colors";
import { usePublicacion } from "@/contexts/PublicacionContext";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import ISO6391 from "iso-639-1";
import React, { useState } from "react";
import { Alert, Modal, StyleSheet, Text, TextInput, View } from "react-native";

export default function LibroScreen() {
  // Steps
  const [step, setStep] = useState(1);
  const [showScanner, setShowScanner] = useState(false);
  const { libro, updateLibro } = usePublicacion();
  const idiomas = ISO6391.getAllNames().map((name) => ({
    label: name,
    value: ISO6391.getCode(name),
  }));

  // Fetch a Google Books API
  const fetchBookData = async (isbn: string) => {
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
          idioma: book.languages?.[0]?.key
            ? book.languages[0].key.replace("/languages/", "")
            : libro.idioma,
          sinopsis: book.excerpts?.[0]?.text || "",
        });
        setStep(2);
      } else {
        Alert.alert("No se encontró información para este ISBN");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error buscando libro", String(err));
    }
  };

  // --- Render de cada step ---
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
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
              />
              <PrimaryButton
                styleBtn={styles.styleBtn}
                title="Buscar por ISBN"
                onPress={() => fetchBookData(String(libro.isbn))}
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
            <Text style={styles.label}>Sinopsis</Text>
            <TextInput
              value={libro.sinopsis}
              onChangeText={(text) => updateLibro({ sinopsis: text })}
              placeholder="Sinopsis"
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
      {renderStep()}

      {/* Navegación de steps */}
      {step === 2 && (
        <PrimaryButton
          styleBtn={{ marginTop: 26, height: 36 }}
          title="Siguiente"
          onPress={() => setStep(step + 1)}
        />
      )}
      {step === 3 && (
        <PrimaryButton
          styleBtn={{ marginTop: 26, height: 36 }}
          title="Siguiente"
          onPress={() => router.push("/(tabs)/(publicacion)/publicacion")}
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
    justifyContent: "center",
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
    gap: 10,
  },
  styleBtn: {
    width: "48%",
    height: 36,
  },
  styleTxt: {
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
