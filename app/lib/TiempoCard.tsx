import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { consejos, tiempoEn, type Consejo, type Lugar } from '../../src/lib/tiempo';
import { C, s } from './ui';

// La misma clave que usa "Tu piel hoy" en la web: si ya diste tu
// ubicación allí, la app la reutiliza.
const K = 'mirandaglow.lugar';

export function TiempoCard() {
  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [lista, setLista] = useState<Consejo[] | null>(null);
  const [temp, setTemp] = useState<number | null>(null);
  const [aviso, setAviso] = useState('');
  const [listo, setListo] = useState(false);

  async function cargar(l: Lugar) {
    try {
      const t = await tiempoEn(l.lat, l.lon);
      setLugar(l); setTemp(t.temp); setLista(consejos(t).slice(0, 2));
      await AsyncStorage.setItem(K, JSON.stringify(l));
    } catch {
      setAviso('No hemos podido consultar el tiempo. Prueba más tarde.');
    }
  }

  useEffect(() => {
    AsyncStorage.getItem(K).then((g) => {
      if (g) cargar(JSON.parse(g));
      setListo(true);
    });
  }, []);

  function pedir() {
    if (Platform.OS !== 'web' || !navigator.geolocation) { setAviso('Activa la ubicación desde la web de Miranda Glow.'); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => cargar({ nombre: 'tu zona', lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setAviso('Sin permiso de ubicación no podemos ver el tiempo.'),
      { maximumAge: 3600_000, timeout: 10_000 },
    );
  }

  if (!listo) return null;

  if (!lugar)
    return (
      <Pressable style={s.cardLine} onPress={pedir}>
        <Text style={s.kicker}>Tu piel hoy</Text>
        <Text style={[s.p, { color: C.text }]}>Consejos según el tiempo que hace donde estás: sol, viento, frío o polen. Toca para usar tu ubicación.</Text>
        {!!aviso && <Text style={[s.p, { color: C.warn }]}>{aviso}</Text>}
      </Pressable>
    );

  return (
    <View style={s.card}>
      <Text style={s.kicker}>Tu piel hoy{temp != null ? ` · ${temp}° en ${lugar.nombre}` : ''}</Text>
      {lista?.map((c) => (
        <View key={c.titulo} style={{ marginTop: 6 }}>
          <Text style={{ color: c.nivel === 'alto' ? C.warn : C.text, fontWeight: '600', fontSize: 14 }}>{c.titulo}</Text>
          <Text style={s.p}>{c.texto}</Text>
        </View>
      ))}
      {!!aviso && <Text style={[s.p, { color: C.warn }]}>{aviso}</Text>}
    </View>
  );
}
