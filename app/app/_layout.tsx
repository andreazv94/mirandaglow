import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StyleSheet, View } from 'react-native';
import { C } from '../lib/ui';

export default function RootLayout() {
  return (
    <View style={st.outer}>
      <Head>
        <title>Miranda Glow · Tu rutina diaria</title>
        <meta name="description" content="Tu rutina de skincare personalizada, paso a paso, cada día." />
        <meta name="theme-color" content={C.bg} />
      </Head>
      {/* En ordenador la app se ve como un móvil centrado */}
      <View style={st.inner}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: 'fade' }} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#0B0C12', alignItems: 'center' },
  inner: { flex: 1, width: '100%', maxWidth: 480, backgroundColor: C.bg },
});
