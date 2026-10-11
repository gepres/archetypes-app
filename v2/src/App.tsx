import React, { useCallback, useRef, useState } from 'react';
import { calcularResultadoDilemas } from './lib/domain';
import type { AssessmentResult, RespuestaDilema } from './lib/domain';
import { callar } from './lib/voice';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TestScreen } from './components/TestScreen';
import type { TipoTest } from './components/TestScreen';
import { RevealScreen } from './components/RevealScreen';
import { HistoriaScreen } from './components/HistoriaScreen';

type Paso = 'bienvenida' | 'historia' | 'test' | 'revelacion';

const CLAVE_SILENCIO = 'arquetipos_v2_silencio';

export const App: React.FC = () => {
  const [paso, setPaso] = useState<Paso>('bienvenida');
  // Quien vuelve del recorrido «¿Qué es un arquetipo?» viene a elegir su test: se le señala.
  const [aElegir, setAElegir] = useState(false);
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

  // De quien es la sesion cuando empieza el test (ver terminarTest).
  const duenoRef = useRef(leerDueno());

  const terminarTest = useCallback((respuestas: RespuestaDilema[]) => {
    // En perspectiva universal: la V2 no pregunta nada mas que las situaciones,
    // asi que nadie ha podido elegir una perspectiva concreta.
    const res = calcularResultadoDilemas(respuestas, tipoRef.current, 'universal');
    setResultado(res);
    setPaso('revelacion');
    // Se guarda para que la version completa lo encuentre ya hecho, pero solo si sigue
    // abierta la misma cuenta que empezo el test: si otra pestaña cambio de cuenta entretanto,
    // guardarlo seria dejar el resultado de una persona en la cuenta de otra.
    if (leerDueno() !== duenoRef.current) return;
    try {
      localStorage.setItem('archetypes_current_result', JSON.stringify(res));
      const previo = JSON.parse(localStorage.getItem('archetypes_history') || '[]');
      // Sin recortar: el historial es de la persona, y la version completa lo sube a su cuenta.
      localStorage.setItem('archetypes_history', JSON.stringify([res, ...previo]));
      localStorage.setItem('archetype_perspective_selected', 'true');
    } catch {}
  }, []);

  const repetir = useCallback(() => {
    setResultado(null);
    setPaso('bienvenida');
  }, []);

  const arrancarTest = (elegido: TipoTest) => {
    setAElegir(false);
    duenoRef.current = leerDueno();
    setTipo(elegido);
    tipoRef.current = elegido;
    setPaso('test');
  };

  if (paso === 'bienvenida') {
    return (
      <WelcomeScreen
        onEmpezar={arrancarTest}
        onConocerlos={() => setPaso('historia')}
        aElegir={aElegir}
      />
    );
  }

  if (paso === 'historia') {
    return (
      <HistoriaScreen
        silencio={silencio}
        onToggleSilencio={alternarSilencio}
        onCerrar={() => {
          setAElegir(false);
          setPaso('bienvenida');
        }}
        onElegirTest={() => {
          setAElegir(true);
          setPaso('bienvenida');
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

/** La cuenta abierta en este navegador (la escribe la version completa). */
function leerDueno(): string {
  try {
    return JSON.parse(localStorage.getItem('archetypes_user_profile') || '{}').id || 'user-guest';
  } catch {
    return 'user-guest';
  }
}
