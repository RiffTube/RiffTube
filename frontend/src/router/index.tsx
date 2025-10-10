import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthSuccessPage from '@/features/auth/components/AuthSuccessPage/AuthSuccessPage';
import RequireAuth from '@/features/auth/guards/RequireAuth';
import LandingPage from '@/features/marketing/routes/LandingPage';
import DemoPlayer from '@/features/spike/DemoPlayer';
import StudioLayout from '@/features/studio/Layout/StudioLayout';
import HomeDashboard from '@/features/studio/routes/HomeDashboard';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<DemoPlayer />} />
        <Route path="/auth/success" element={<AuthSuccessPage />} />

        {/* Protected studio area */}
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<StudioLayout />}>
            <Route index element={<HomeDashboard />} />
          </Route>
          <Route path="/studio" element={<StudioLayout />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
