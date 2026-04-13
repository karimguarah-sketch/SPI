import { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Homepage } from './components/home/Homepage';
import { BulkEditionPage } from './components/bulk/BulkEditionPage';

export type ScreenId = 'home' | 'bulk-edition';

function App() {
  const [screen, setScreen] = useState<ScreenId>('home');

  return (
    <AppShell>
      {screen === 'home' && <Homepage onStartBulkEdition={() => setScreen('bulk-edition')} />}
      {screen === 'bulk-edition' && <BulkEditionPage onBack={() => setScreen('home')} />}
    </AppShell>
  );
}

export default App;
