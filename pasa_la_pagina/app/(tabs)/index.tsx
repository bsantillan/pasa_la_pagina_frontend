import { AlertCard } from '@/components/ui/AlertaCard';
import { Avatar } from '@/components/ui/Avatar';
import PrimaryButton from '@/components/ui/Boton/Primary';
import SecondaryButton from '@/components/ui/Boton/Secondary';
import { ConnectCard } from '@/components/ui/ConnectCard';
import { ProductCard } from '@/components/ui/ProductCard';
import { ReviewCard } from '@/components/ui/ReviewCard';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hola</Text>
      <PrimaryButton title="Presióname" onPress={() => alert('Botón presionado!')} />
      <SecondaryButton title="Presióname también" onPress={() => alert('Botón secundario presionado!')} />
      <Image source={require('../../assets/images/logo.png')} style={{ width: 100, height: 100, marginTop: 20 }} />
      <Avatar name="Ana" size={80} />
      <ConnectCard   username="Ana"  publicationTitle="Zapatillas Nike" onSend={() => console.log("Mensaje enviado")} onCancel={() => console.log("Acción cancelada")}/>
      <AlertCard title='hola' description='esta es una alerta' onAccept={() => alert('Alerta aceptada')}/>
      <ProductCard imageUrl='https://img.freepik.com/foto-gratis/composicion-libros-libro-abierto_23-2147690555.jpg?semt=ais_hybrid&w=740&q=80' title='Producto 1' description='Descripción del producto 1' />
      <ReviewCard username='usuario123' headline='Gran producto' description='Me encantó este producto, lo recomiendo mucho.' date='2023-10-01' />
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
