import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './features/auth';
import AuthScopedCache from './features/auth/components/AuthScopedCache';
import { createQueryClient } from './queryClient';
import AppRouter from './router';

/// <reference types="vite-plugin-svgr/client" />
function App() {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthScopedCache>
          <AppRouter />
        </AuthScopedCache>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
