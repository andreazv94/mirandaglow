import { StyleSheet, Text, View } from 'react-native';
import { lastWeek, streak } from '../lib/data';
import { useRutina } from '../lib/useRutina';
import { C, Screen, s } from '../lib/ui';

const DIAS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export default function Progreso() {
  const { rutina, history } = useRutina();
  if (!rutina) return <Screen nav><Text style={s.p}>Cargando…</Text></Screen>;
  const racha = streak(history, rutina);
  const semana = lastWeek(history, rutina);
  const media = Math.round((semana.reduce((t, d) => t + d.pct, 0) / 7) * 100);

  return (
    <Screen nav>
      <Text style={s.h1}>Tu progreso</Text>
      <Text style={s.p}>Constancia antes que perfección.</Text>

      <View style={[s.card, { alignItems: 'center', paddingVertical: 22 }]}>
        <Text style={st.big}>{racha}</Text>
        <Text style={s.p}>{racha === 1 ? 'día seguido' : 'días seguidos'} con la rutina completa</Text>
      </View>

      <View style={s.card}>
        <Text style={s.h2}>Últimos 7 días</Text>
        <View style={st.week}>
          {semana.map((d, n) => {
            const full = d.pct >= 1;
            return (
              <View key={n} style={{ alignItems: 'center', gap: 6 }}>
                <View style={[st.dot, full && st.full, !full && d.pct > 0 && st.half]}>
                  <Text style={st.dotT}>{full ? '✓' : ''}</Text>
                </View>
                <Text style={[s.p, { fontSize: 10.5 }, n === 6 && { color: C.accent }]}>{n === 6 ? 'Hoy' : DIAS[d.date.getDay()]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.h2}>Pasos hechos esta semana</Text>
        <Text style={st.pct}>{media}%</Text>
        <Text style={s.p}>
          {media === 0 ? 'Marca los pasos en "Hoy" a medida que los hagas.' : 'Los resultados de la piel se ven a partir de 4–8 semanas de constancia.'}
        </Text>
      </View>
    </Screen>
  );
}

const st = StyleSheet.create({
  big: { color: C.accent, fontSize: 52, fontWeight: '600' },
  week: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  dot: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: C.divider, alignItems: 'center', justifyContent: 'center' },
  full: { backgroundColor: C.accent, borderColor: C.accent },
  half: { borderColor: C.accent },
  dotT: { color: C.bg, fontSize: 12, fontWeight: '800' },
  pct: { color: C.text, fontSize: 34, fontWeight: '600' },
});
