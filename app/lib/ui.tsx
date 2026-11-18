import type { ReactNode } from 'react';
import { Linking, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, usePathname } from 'expo-router';

// Sistema visual Nocturne (oscuro), del handoff de diseño.
export const C = {
  bg: '#161826', surface: '#232532', soft: '#292B31', text: '#E9E9ED', muted: '#9397AB',
  accent: '#6CC3CF', accentSoft: '#22474D', divider: '#3F424D', white: '#F5F4FF', warn: '#E8B66B',
};

/** Pantalla con scroll y, opcionalmente, barra de navegación inferior. */
export function Screen({ children, nav = false, scroll = true }: { children: ReactNode; nav?: boolean; scroll?: boolean }) {
  const body = scroll
    ? <ScrollView contentContainerStyle={[s.body, nav && { paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>{children}</ScrollView>
    : <View style={[s.body, { flex: 1 }]}>{children}</View>;
  return <SafeAreaView style={s.safe}>{body}{nav && <Nav />}</SafeAreaView>;
}

export function Back({ label = 'Volver' }: { label?: string }) {
  return (
    <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/routine'))} hitSlop={10}>
      <Text style={s.back}>‹ {label}</Text>
    </Pressable>
  );
}

const TABS: [string, string, string][] = [
  ['Hoy', '/routine', '⌂'], ['Semana', '/actives', '▦'], ['Productos', '/shelf', '▣'], ['Progreso', '/progress', '◒'], ['Perfil', '/profile', '○'],
];
function Nav() {
  const path = usePathname();
  return (
    <View style={s.nav}>
      {TABS.map(([label, href, icon]) => {
        const on = path === href;
        return (
          <Pressable key={href} onPress={() => router.replace(href as never)} style={s.navItem}>
            <Text style={[s.navIcon, on && s.on]}>{icon}</Text>
            <Text style={[s.navLabel, on && s.on]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const Btn = ({ label, onPress, kind = 'primary', disabled }: { label: string; onPress: () => void; kind?: 'primary' | 'ghost'; disabled?: boolean }) => (
  <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [kind === 'primary' ? s.primary : s.ghost, (pressed || disabled) && { opacity: disabled ? 0.45 : 0.85 }]}>
    <Text style={kind === 'primary' ? s.primaryText : s.ghostText}>{label}</Text>
  </Pressable>
);

export const Chip = ({ label, outline }: { label: string; outline?: boolean }) => (
  <Text style={outline ? s.chipOutline : s.chip}>{label}</Text>
);

/** Abre el enlace del producto (afiliado) en una pestaña nueva. */
export function openProduct(url: string) {
  if (Platform.OS === 'web') window.open(url, '_blank', 'noopener');
  else Linking.openURL(url);
}

export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  body: { padding: 20, paddingTop: 18, paddingBottom: 40, gap: 12 },
  back: { color: C.accent, fontSize: 14 },
  kicker: { color: C.accent, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: '600' },
  h1: { color: C.text, fontSize: 28, fontWeight: '600', marginTop: 4 },
  h2: { color: C.text, fontSize: 17, fontWeight: '600' },
  p: { color: C.muted, fontSize: 13, lineHeight: 19 },
  card: { backgroundColor: C.surface, borderRadius: 10, padding: 14, gap: 6 },
  cardLine: { borderWidth: 1, borderColor: C.accentSoft, borderRadius: 10, padding: 14, gap: 6 },
  warnCard: { backgroundColor: '#2E2A22', borderRadius: 10, padding: 14, gap: 6, borderLeftWidth: 3, borderLeftColor: C.warn },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: C.accentSoft, color: C.white, fontSize: 11, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  chipOutline: { borderWidth: 1, borderColor: C.accent, color: C.accent, fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  primary: { minHeight: 48, borderRadius: 8, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  primaryText: { color: C.bg, fontSize: 14.5, fontWeight: '700' },
  ghost: { minHeight: 44, borderRadius: 8, borderWidth: 1, borderColor: C.divider, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  ghostText: { color: C.text, fontSize: 13 },
  nav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 72, paddingBottom: 12, paddingTop: 9, backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.soft, flexDirection: 'row', justifyContent: 'space-around' },
  navItem: { alignItems: 'center', minWidth: 58 },
  navIcon: { color: '#75798C', fontSize: 19, height: 23 },
  navLabel: { color: '#75798C', fontSize: 10 },
  on: { color: C.accent },
});
