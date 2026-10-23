import { useState } from 'react';
import { requestMotionPermission } from './hooks/useParallax';
import { ArrivalScreen } from './screens/ArrivalScreen';
import { NavigateScreen } from './screens/NavigateScreen';
import { SelectScreen } from './screens/SelectScreen';

type Screen = 'select' | 'navigate' | 'arrival';

export default function App() {
  const [screen, setScreen] = useState<Screen>('select');
  const [run, setRun] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const startRoute = () => {
    // Debe ejecutarse dentro del toque para que iOS muestre el permiso.
    void requestMotionPermission();
    setStartedAt(Date.now());
    setRun((r) => r + 1);
    setScreen('navigate');
  };

  const arrive = () => {
    setElapsedMs(Date.now() - startedAt);
    setScreen('arrival');
  };

  return (
    <div className="app">
      {screen === 'select' && <SelectScreen key={`select-${run}`} onStart={startRoute} />}
      {screen === 'navigate' && (
        <NavigateScreen key={`nav-${run}`} onArrive={arrive} onExit={() => setScreen('select')} />
      )}
      {screen === 'arrival' && (
        <ArrivalScreen elapsedMs={elapsedMs} onFinish={() => setScreen('select')} onRepeat={startRoute} />
      )}
    </div>
  );
}
