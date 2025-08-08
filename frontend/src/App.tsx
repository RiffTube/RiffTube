import { AuthProvider } from './features/auth';
import AppRouter from './router';

/// <reference types="vite-plugin-svgr/client" />
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
