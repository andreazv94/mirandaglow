import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { visibleQuestions } from '../../src/components/quiz-logic';
import { loadAnswers, saveAnswers, type Answers } from '../lib/data';
import { Btn, C, Screen, s } from '../lib/ui';

export default function Onboarding() {
  const [ready, setReady] = useState(false);
  const [i, setI] = useState(0);
  const [a, setA] = useState<Answers>({});
  const [saving, setSaving] = useState(false);

  // Si ya hizo el diagnóstico, directa a su rutina
  useEffect(() => {
    loadAnswers().then((saved) => (saved ? router.replace('/routine') : setReady(true)));
  }, []);

  if (!ready) return <Screen><Text style={s.p}>Cargando…</Text></Screen>;

  const qs = visibleQuestions(a);
  const q = qs[Math.min(i, qs.length - 1)];
  const sel = a[q.id];
  const many = (sel as string[] | undefined) || [];

  async function finish(next: Answers) {
    setSaving(true);
    await saveAnswers(next);
    setTimeout(() => router.replace('/routine'), 700);
  }
  function advance(next: Answers) {
    const list = visibleQuestions(next);
    if (i < list.length - 1) setI(i + 1);
    else finish(next);
  }
  function pick(v: string) {
    if (q.multi) {
      const upd = many.includes(v) ? many.filter((x) => x !== v) : q.max && many.length >= q.max ? many : [...many, v];
      setA({ ...a, [q.id]: upd });
    } else {
      const next = { ...a, [q.id]: v };
      setA(next);
      setTimeout(() => advance(next), 150);
    }
  }

  if (saving)
    return (
      <Screen scroll={false}>
        <View style={st.center}>
          <View style={st.circle} />
          <Text style={s.h2}>Armando tu rutina</Text>
          <Text style={[s.p, { textAlign: 'center' }]}>Cruzamos tu piel, tus objetivos, tu edad y tu momento hormonal.</Text>
        </View>
      </Screen>
    );

  return (
    <Screen>
      <View style={st.track}><View style={[st.fill, { width: `${((i + 1) / qs.length) * 100}%` }]} /></View>
      <Text style={[s.kicker, { marginTop: 14 }]}>Pregunta {i + 1} de {qs.length}</Text>
      <Text style={st.q}>{q.q}</Text>
      {!!q.help && <Text style={s.p}>{q.help}</Text>}
      <View style={{ gap: 9, marginTop: 6 }}>
        {q.opts.map((o) => {
          const on = q.multi ? many.includes(o.v) : sel === o.v;
          const off = q.multi && !!q.max && many.length >= q.max && !on;
          return (
            <Pressable key={o.v} onPress={() => pick(o.v)} style={({ pressed }) => [st.opt, on && st.optOn, (pressed || off) && { opacity: off ? 0.45 : 0.85 }]}>
              <View style={[st.check, on && st.checkOn]}>{on && <Text style={st.checkTxt}>✓</Text>}</View>
              <View style={{ flex: 1 }}>
                <Text style={st.optT}>{o.t}</Text>
                {!!o.s && <Text style={st.optS}>{o.s}</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={[s.row, { marginTop: 12 }]}>
        {i > 0 && <Pressable onPress={() => setI(i - 1)} style={{ padding: 12 }}><Text style={{ color: C.muted }}>Atrás</Text></Pressable>}
        {q.multi && (
          <View style={{ flex: 1 }}>
            <Btn label={`Continuar${q.max ? ` (${many.length}/${q.max})` : ''}`} disabled={!many.length} onPress={() => advance(a)} />
          </View>
        )}
      </View>
      {i === 0 && <Text style={[s.p, { fontSize: 11.5, marginTop: 10 }]}>🔒 Tus respuestas se guardan solo en este dispositivo. No las enviamos a ningún sitio.</Text>}
    </Screen>
  );
}

const st = StyleSheet.create({
  track: { height: 3, backgroundColor: 'rgba(233,233,237,.12)', borderRadius: 99 },
  fill: { height: 3, backgroundColor: C.accent, borderRadius: 99 },
  q: { color: C.text, fontSize: 25, lineHeight: 30, fontWeight: '700' },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: 8, backgroundColor: C.surface, borderWidth: 1, borderColor: 'transparent' },
  optOn: { borderColor: C.accent },
  check: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: C.divider, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: C.accent, borderColor: C.accent },
  checkTxt: { color: C.bg, fontSize: 12, fontWeight: '800' },
  optT: { color: C.text, fontSize: 15, fontWeight: '500' },
  optS: { color: C.muted, fontSize: 11.5, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 30 },
  circle: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: C.accent, marginBottom: 12 },
});
