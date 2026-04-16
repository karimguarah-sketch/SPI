import { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Homepage } from './components/home/Homepage';
import { BulkEditionPage } from './components/bulk/BulkEditionPage';

export type ScreenId = 'home' | 'bulk-edition';

function App() {
  const [screen, setScreen] = useState<ScreenId>('home');
  const [showToast, setShowToast] = useState(false);

  return (
    <AppShell>
      {screen === 'home' && (
        <Homepage
          onStartBulkEdition={() => setScreen('bulk-edition')}
          showToast={showToast}
          onToastDismiss={() => setShowToast(false)}
        />
      )}
      {screen === 'bulk-edition' && (
        <BulkEditionPage
          onBack={() => setScreen('home')}
          onConfirm={() => {
            setScreen('home');
            setShowToast(true);
          }}
        />
      )}
    </AppShell>
  );
}

export default App;
