import React, { useCallback, useRef, useState } from 'react';
import { calculateAssessmentResult } from './lib/domain';
import type { AssessmentAnswer, AssessmentResult } from './lib/domain';
import { callar } from './lib/voice';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TestScreen } from './components/TestScreen';
import type { TipoTest } from './components/TestScreen';
import { RevealScreen } from './components/RevealScreen';

type Paso = 'bienvenida' | 'test' | 'revelacion';

const CLAVE_SILENCIO = 'arquetipos_v2_silencio';

export const App: React.FC = () => {
  const [paso, setPaso] = useState<Paso>('bienvenida');
  const [tipo, setTipo] = useState<TipoTest>('quick');
  // Espejo del tipo para el cierre de terminarTest, que se quiere estable.
  const tipoRef = useRef<TipoTest>('quick');
  const [resultado, setResultado] = useState<AssessmentResult | null>(null);
  const [silencio, setSilencio] = useState<boolean>(() => {
    try {
      return localStorage.getItem(CLAVE_SILENCIO) === 'true';
    } catch {
      return false;
    }
  });

  const alternarSilencio = useCallback(() => {
    setSilencio(s => {
      const nuevo = !s;
      try {
        localStorage.setItem(CLAVE_SILENCIO, String(nuevo));
      } catch {}
      if (nuevo) callar();
      return nuevo;
    });
  }, []);

  const terminarTest = useCallback((respuestas: AssessmentAnswer[]) => {
    // En perspectiva universal: la V2 no pregunta nada mas que las afirmaciones,
    // asi que nadie ha podido elegir una perspectiva concreta.
    const res = calculateAssessmentResult(respuestas, tipoRef.current, 'universal');
    setResultado(res);
    setPaso('revelacion');
    // Se guarda para que la version completa lo encuentre ya hecho.
    try {
      localStorage.setItem('archetypes_current_result', JSON.stringify(res));
      const previo = JSON.parse(localStorage.getItem('archetypes_history') || '[]');
      localStorage.setItem('archetypes_history', JSON.stringify([res, ...previo].slice(0, 20)));
      localStorage.setItem('archetype_perspective_selected', 'true');
    } catch {}
  }, []);

  const repetir = useCallback(() => {
    setResultado(null);
    setPaso('bienvenida');
  }, []);

  if (paso === 'bienvenida') {
    return (
      <WelcomeScreen
        onEmpezar={elegido => {
          setTipo(elegido);
          tipoRef.current = elegido;
          setPaso('test');
        }}
      />
    );
  }

  if (paso === 'test') {
    return (
      <TestScreen
        tipo={tipo}
        silencio={silencio}
        onToggleSilencio={alternarSilencio}
        onTerminar={terminarTest}
      />
    );
  }

  return resultado ? (
    <RevealScreen
      resultado={resultado}
      silencio={silencio}
      onToggleSilencio={alternarSilencio}
      onRepetir={repetir}
    />
  ) : null;
};
