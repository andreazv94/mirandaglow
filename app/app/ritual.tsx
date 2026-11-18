import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { dayKey, howTo, itemsFor, saveHistory, stepKey, type Moment } from '../lib/data';
import { useRutina } from '../lib/useRutina';
import { Btn, C, Chip, Screen, s } from '../lib/ui';

export default function Ritual() {
  const { mode: m } = useLocalSearchParams<{ mode?: string }>();
  const mode: Moment = m === 'pm' ? 'pm' : 'am';
  const { rutina, history, setHistory } = useRutina();
  const [i, setI] = useState(0);

  if (!rutina) return <Screen scroll={false}><Text style={s.p}>Cargando…</Text></Screen>;
  const items = itemsFor(rutina, mode).filter((p) => p.orden < 6);
  const p = items[Math.min(i, items.length - 1)];
  const close = () => (router.canGoBack() ? router.back() : router.replace('/routine'));

  async function next(markDone: boolean) {
    if (markDone) {
      const today = dayKey();
      const done = history[today] || [];
      const k = stepKey(mode, p.id);
      if (!done.includes(k)) {
        const h = { ...history, [today]: [...done, k] };
        setHistory(h);
        await saveHistory(h);
      }
    }
    if (i < items.length - 1) setI(i + 1);
    else close();
  }

  return (
    <Screen scroll={false}>
      <View style={[s.row, { gap: 14 }]}>
        <View style={[s.row, { flex: 1, gap: 5 }]}>
          {items.map((_, n) => <View key={n} style={[st.seg, { backgroundColor: n <= i ? C.accent : C.divider }]} />)}
        </View>
        <Pressable onPress={close} hitSlop={10}><Text style={{ color: C.muted, fontSize: 27, lineHeight: 27 }}>×</Text></Pressable>
      </View>
      <Text style={[s.kicker, { marginTop: 26 }]}>Paso {i + 1} de {items.length} · {p.categoria}</Text>
      <Text style={st.title}>{p.nombre}</Text>
      <Text style={st.how}>{howTo[p.categoria] || p.descripcion}</Text>
      <View style={s.chips}>
        <Chip label={mode === 'am' ? 'Mañana' : 'Noche'} />
        <Chip label={p.frecuencia} outline />
      </View>
      <Text style={[s.p, { marginTop: 8 }]}>{p.descripcion}</Text>
      <View style={{ marginTop: 'auto', gap: 12 }}>
        <Btn label={i === items.length - 1 ? 'Hecho, terminar' : 'Hecho, siguiente paso'} onPress={() => next(true)} />
        <Pressable onPress={() => next(false)}><Text style={{ textAlign: 'center', color: '#75798C', fontSize: 12.5 }}>Saltar este paso hoy</Text></Pressable>
      </View>
    </Screen>
  );
}

const st = StyleSheet.create({
  seg: { height: 3, flex: 1, borderRadius: 99 },
  title: { color: C.text, fontSize: 31, lineHeight: 36, fontWeight: '600' },
  how: { color: '#CFD3E5', fontSize: 15, lineHeight: 22, marginVertical: 6 },
});
