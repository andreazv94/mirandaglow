import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { loadAnswers, loadHistory, loadShelf, routineFor, type Answers, type History, type Rutina } from './data';

/** Carga el diagnóstico, la rutina, el historial y el estante cada vez que se abre una pantalla. */
export function useRutina() {
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [rutina, setRutina] = useState<Rutina | null>(null);
  const [history, setHistory] = useState<History>({});
  const [shelf, setShelf] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const a = await loadAnswers();
        if (!alive) return;
        if (!a) { router.replace('/'); return; }
        const [h, sh] = await Promise.all([loadHistory(), loadShelf()]);
        if (!alive) return;
        setAnswers(a); setRutina(routineFor(a)); setHistory(h); setShelf(sh);
      })();
      return () => { alive = false; };
    }, []),
  );

  return { answers, rutina, history, setHistory, shelf, setShelf };
}
