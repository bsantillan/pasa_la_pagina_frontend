import PrimaryButton from '@/components/Boton/Primary';
import SecondaryButton from '@/components/Boton/Secondary';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hola</Text>
      <PrimaryButton title="Presióname" onPress={() => alert('Botón presionado!')} />
      <SecondaryButton title="Presióname también" onPress={() => alert('Botón secundario presionado!')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // fondo blanco
    justifyContent: 'center', // centra verticalmente
    alignItems: 'center',     // centra horizontalmente
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000', // texto negro
  },
});
