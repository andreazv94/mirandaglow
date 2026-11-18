import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { dayKey, itemsFor, saveHistory, stepKey, streak, type Moment } from '../lib/data';
import { useRutina } from '../lib/useRutina';
import { C, Chip, Screen, openProduct, s } from '../lib/ui';

export default function Hoy() {
  const { rutina, history, setHistory, shelf } = useRutina();
  const [mode, setMode] = useState<Moment>(new Date().getHours() >= 15 ? 'pm' : 'am');
  const [verAvisos, setVerAvisos] = useState(true);

  if (!rutina) return <Screen nav><Text style={s.p}>Preparando tu rutina…</Text></Screen>;

  const today = dayKey();
  const done = history[today] || [];
  const items = itemsFor(rutina, mode);
  const base = items.filter((p) => p.orden < 6);
  const count = base.filter((p) => done.includes(stepKey(mode, p.id))).length;
  const racha = streak(history, rutina);
  const medicos = rutina.res.avisos.filter((x) => x.tipo === 'medico');

  async function toggle(id: string) {
    const k = stepKey(mode, id);
    const next = { ...history, [today]: done.includes(k) ? done.filter((x) => x !== k) : [...done, k] };
    setHistory(next);
    await saveHistory(next);
  }

  return (
    <Screen nav>
      <View style={[s.row, { justifyContent: 'space-between', alignItems: 'flex-end' }]}>
        <View>
          <Text style={s.kicker}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          <Text style={s.h1}>{mode === 'am' ? 'Buenos días' : 'Buenas noches'}</Text>
        </View>
        <Text style={st.racha}>🔥 {racha} {racha === 1 ? 'día' : 'días'}</Text>
      </View>

      <View style={s.chips}>{rutina.res.perfil.map((p) => <Chip key={p} label={p} />)}</View>

      {verAvisos && medicos.length > 0 && (
        <View style={s.warnCard}>
          <View style={[s.row, { justifyContent: 'space-between' }]}>
            <Text style={[s.kicker, { color: C.warn }]}>Importante</Text>
            <Pressable onPress={() => setVerAvisos(false)} hitSlop={10}><Text style={{ color: C.muted, fontSize: 18 }}>×</Text></Pressable>
          </View>
          {medicos.map((x) => <Text key={x.texto} style={[s.p, { color: C.text }]}>{x.texto}</Text>)}
        </View>
      )}

      <View style={s.card}>
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <Text style={s.p}>{count} de {base.length} pasos hechos</Text>
          <Text style={s.p}>{mode === 'am' ? 'Mañana' : 'Noche'}</Text>
        </View>
        <View style={st.track}><View style={[st.fill, { width: `${(count / Math.max(base.length, 1)) * 100}%` }]} /></View>
      </View>

      <View style={s.row}>
        {(['am', 'pm'] as Moment[]).map((m) => (
          <Pressable key={m} onPress={() => setMode(m)} style={[st.seg, mode === m && st.segOn]}>
            <Text style={[st.segT, mode === m && { color: C.accent }]}>{m === 'am' ? '☀ Mañana' : '☾ Noche'}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={s.primary} onPress={() => router.push({ pathname: '/ritual', params: { mode } })}>
        <Text style={s.primaryText}>Empezar paso a paso</Text>
      </Pressable>

      {items.map((p, i) => {
        const isDone = done.includes(stepKey(mode, p.id));
        const extra = p.orden === 6;
        return (
          <View key={p.id} style={st.step}>
            <Pressable onPress={() => toggle(p.id)} hitSlop={8} style={[st.check, isDone && st.checkOn]}>
              <Text style={st.checkT}>{isDone ? '✓' : ''}</Text>
            </Pressable>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.kicker}>{extra ? 'Extra' : `Paso ${i + 1}`} · {p.categoria}</Text>
              <Text style={[st.name, isDone && st.doneT]}>{p.nombre}</Text>
              <Text style={s.p}>{p.descripcion}</Text>
              <View style={[s.chips, { marginTop: 6 }]}>
                <Chip label={p.frecuencia} />
                {shelf.includes(p.id)
                  ? <Chip label="✓ Lo tengo" outline />
                  : <Pressable onPress={() => openProduct(p.url)}><Chip label={`Ver en ${p.tienda} · ${p.precio}`} outline /></Pressable>}
              </View>
            </View>
          </View>
        );
      })}

      {rutina.res.semana && (
        <Pressable style={s.cardLine} onPress={() => router.replace('/actives')}>
          <Text style={s.kicker}>Activos de noche</Text>
          <Text style={[s.p, { color: C.text }]}>Tienes varios activos fuertes. Mira qué toca cada noche para no mezclarlos →</Text>
        </Pressable>
      )}
    </Screen>
  );
}

const st = StyleSheet.create({
  racha: { color: C.text, backgroundColor: C.soft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, fontSize: 12, overflow: 'hidden' },
  track: { height: 4, backgroundColor: C.divider, borderRadius: 99, marginTop: 6 },
  fill: { height: 4, backgroundColor: C.accent, borderRadius: 99 },
  seg: { flex: 1, padding: 9, borderWidth: 1, borderColor: C.divider, borderRadius: 8, alignItems: 'center' },
  segOn: { borderColor: C.accent },
  segT: { color: C.muted, fontSize: 13.5 },
  step: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 10, backgroundColor: C.surface },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: C.divider, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkOn: { backgroundColor: C.accent, borderColor: C.accent },
  checkT: { color: C.bg, fontWeight: '800' },
  name: { color: C.text, fontSize: 16, fontWeight: '500' },
  doneT: { opacity: 0.5, textDecorationLine: 'line-through' },
});
