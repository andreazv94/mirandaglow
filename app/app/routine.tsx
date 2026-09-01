import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function RoutineScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.kicker}>MARTES 1 DE SEPTIEMBRE</Text>
        <Text style={styles.title}>Buenos días</Text>
        <Text style={styles.subtitle}>Tu rutina personalizada está lista.</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Siguiente paso</Text>
          <Text style={styles.cardText}>Aquí construiremos la rutina AM/PM, el progreso y el modo ritual.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B0C12' },
  container: { flex: 1, padding: 20, paddingTop: 40 },
  kicker: { color: '#D9A7FF', fontSize: 10, letterSpacing: 1.2, fontWeight: '700' },
  title: { color: '#F2F1F5', fontSize: 28, fontWeight: '700', marginTop: 7 },
  subtitle: { color: '#9697A3', fontSize: 13, marginTop: 6 },
  card: { marginTop: 28, padding: 16, borderRadius: 10, backgroundColor: '#151721', borderWidth: 1, borderColor: '#292B36' },
  cardTitle: { color: '#F2F1F5', fontSize: 16, fontWeight: '600' },
  cardText: { color: '#9697A3', fontSize: 13, lineHeight: 19, marginTop: 6 },
});
