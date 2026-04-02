import { StoreProvider } from './store';
import { AppShell } from './components/layout/AppShell';

function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}

export default App;
