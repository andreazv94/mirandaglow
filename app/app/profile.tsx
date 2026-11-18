import { Platform, Text, View } from 'react-native';
import { router } from 'expo-router';
import { clearAll, clearAnswers } from '../lib/data';
import { useRutina } from '../lib/useRutina';
import { Btn, C, Chip, Screen, s } from '../lib/ui';

export default function Perfil() {
  const { rutina } = useRutina();
  if (!rutina) return <Screen nav><Text style={s.p}>Cargando…</Text></Screen>;
  const { res } = rutina;
  const info = res.avisos.filter((x) => x.tipo === 'info');

  function confirmar(msg: string) {
    return Platform.OS === 'web' ? window.confirm(msg) : true;
  }
  async function repetir() {
    if (!confirmar('¿Repetir el diagnóstico? Tu historial de días se conserva.')) return;
    await clearAnswers();
    router.replace('/');
  }
  async function borrar() {
    if (!confirmar('¿Borrar todos tus datos de este dispositivo?')) return;
    await clearAll();
    router.replace('/');
  }

  return (
    <Screen nav>
      <Text style={s.h1}>Tu perfil</Text>
      <View style={s.card}>
        <Text style={s.kicker}>Tu diagnóstico</Text>
        <View style={s.chips}>{res.perfil.map((p) => <Chip key={p} label={p} />)}</View>
        <Text style={s.p}>Tu rutina tiene {res.rutina.length} productos elegidos para tu piel.</Text>
      </View>

      <View style={s.card}>
        <Text style={s.kicker}>Consejos para ti</Text>
        {res.consejos.map((c) => <Text key={c} style={[s.p, { color: C.text }]}>• {c}</Text>)}
      </View>

      {info.map((x) => (
        <View key={x.texto} style={s.cardLine}><Text style={s.p}>{x.texto}</Text></View>
      ))}

      <Btn label="Repetir diagnóstico" kind="ghost" onPress={repetir} />
      <Btn label="Borrar mis datos" kind="ghost" onPress={borrar} />

      <Text style={[s.p, { fontSize: 11.5 }]}>
        🔒 Tus respuestas y tu progreso se guardan solo en este dispositivo. Esta app es orientativa y no sustituye la consulta con una dermatóloga.
      </Text>
      <Text style={[s.p, { fontSize: 11.5, color: C.accent }]} onPress={() => { if (Platform.OS === 'web') window.location.href = '/'; }}>
        ← Volver a mirandaglow.com
      </Text>
    </Screen>
  );
}
