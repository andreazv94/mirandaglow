import { Text, View } from 'react-native';
import { Back, Screen, s } from '../lib/ui';

// El reconocimiento de productos todavía no existe. Hasta que funcione de
// verdad, mostramos esta pantalla en lugar de un resultado inventado.
export default function Escaner() {
  return (
    <Screen>
      <Back />
      <Text style={[s.kicker, { marginTop: 14 }]}>Próximamente</Text>
      <Text style={s.h1}>Escanear productos</Text>
      <Text style={s.p}>
        Muy pronto podrás hacer una foto a un producto que ya tienes y te diremos en qué paso de tu rutina va y si choca con otro activo.
      </Text>
      <View style={s.card}>
        <Text style={s.h2}>Mientras tanto</Text>
        <Text style={s.p}>En "Productos" puedes marcar los que ya tienes en casa.</Text>
      </View>
    </Screen>
  );
}
