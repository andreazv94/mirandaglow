import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { saveShelf } from '../lib/data';
import { useRutina } from '../lib/useRutina';
import { C, Chip, Screen, openProduct, s } from '../lib/ui';

export default function Productos() {
  const { rutina, shelf, setShelf } = useRutina();
  if (!rutina) return <Screen nav><Text style={s.p}>Cargando…</Text></Screen>;
  const lista = rutina.res.rutina;
  const tengo = lista.filter((p) => shelf.includes(p.id)).length;

  async function toggle(id: string) {
    const next = shelf.includes(id) ? shelf.filter((x) => x !== id) : [...shelf, id];
    setShelf(next);
    await saveShelf(next);
  }

  return (
    <Screen nav>
      <Text style={s.h1}>Tus productos</Text>
      <Text style={s.p}>Tienes {tengo} de {lista.length}. Marca los que ya tienes en casa.</Text>

      {lista.map((p) => {
        const on = shelf.includes(p.id);
        return (
          <View key={p.id} style={st.item}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.kicker}>{p.categoria}</Text>
              <Text style={st.name}>{p.nombre}</Text>
              <Text style={[s.p, { fontSize: 12 }]}>{p.frecuencia}</Text>
              <View style={[s.chips, { marginTop: 6 }]}>
                <Pressable onPress={() => toggle(p.id)}><Chip label={on ? '✓ Lo tengo' : '+ Ya lo tengo'} outline={!on} /></Pressable>
                {!on && <Pressable onPress={() => openProduct(p.url)}><Chip label={`Ver en ${p.tienda} · ${p.precio}`} outline /></Pressable>}
              </View>
            </View>
          </View>
        );
      })}

      <Pressable style={s.cardLine} onPress={() => router.push('/scanner')}>
        <Text style={s.kicker}>Próximamente</Text>
        <Text style={[s.p, { color: C.text }]}>Escanear un producto que ya tienes para saber en qué paso va →</Text>
      </Pressable>
    </Screen>
  );
}

const st = StyleSheet.create({
  item: { flexDirection: 'row', gap: 12, padding: 13, backgroundColor: C.surface, borderRadius: 10 },
  name: { color: C.text, fontSize: 15, fontWeight: '500' },
});
