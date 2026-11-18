import { StyleSheet, Text, View } from 'react-native';
import { fases } from '../../src/components/quiz-logic';
import { useRutina } from '../lib/useRutina';
import { C, Screen, s } from '../lib/ui';

export default function Semana() {
  const { rutina } = useRutina();
  if (!rutina) return <Screen nav><Text style={s.p}>Cargando…</Text></Screen>;
  const { semana, fase } = rutina.res;
  const hoy = (new Date().getDay() + 6) % 7; // 0 = lunes
  const f = fase ? fases[fase] : undefined;

  return (
    <Screen nav>
      <Text style={s.h1}>Tu semana</Text>
      <Text style={s.p}>Repartimos los activos fuertes para que tu piel tenga tiempo de recuperarse.</Text>

      {semana ? (
        <View style={{ gap: 8, marginTop: 6 }}>
          {semana.map((d, n) => (
            <View key={d.dia} style={[st.day, n === hoy && st.today]}>
              <Text style={[st.dayName, n === hoy && { color: C.accent }]}>{n === hoy ? `Hoy · ${d.dia}` : d.dia}</Text>
              <Text style={[st.act, d.activo === 'Solo hidratar' && { color: C.muted }]}>{d.activo}</Text>
            </View>
          ))}
          <Text style={[s.p, { marginTop: 4 }]}>Las noches de "Solo hidratar" usa limpieza, tus sérums suaves y la crema.</Text>
        </View>
      ) : (
        <View style={s.card}>
          <Text style={s.h2}>Sin activos que alternar</Text>
          <Text style={s.p}>Tu rutina no tiene varios activos fuertes, así que puedes seguirla igual todas las noches.</Text>
        </View>
      )}

      {f && (
        <View style={[s.cardLine, { marginTop: 8 }]}>
          <Text style={s.kicker}>Tu ciclo · {f.dias}</Text>
          <Text style={s.h2}>{f.nombre}</Text>
          <Text style={s.p}>{f.piel}</Text>
          <Text style={[s.p, { color: C.text }]}>{f.consejo}</Text>
          <Text style={[s.p, { fontSize: 11.5 }]}>Cuando cambies de fase, actualízala en Perfil → Repetir diagnóstico.</Text>
        </View>
      )}
    </Screen>
  );
}

const st = StyleSheet.create({
  day: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.surface, borderRadius: 8, padding: 13, borderWidth: 1, borderColor: 'transparent' },
  today: { borderColor: C.accent },
  dayName: { color: C.muted, fontSize: 13, width: 110 },
  act: { color: C.text, fontSize: 14, flex: 1, textAlign: 'right' },
});
