import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthSuccessPage from '@/features/auth/components/AuthSuccessPage/AuthSuccessPage';
import LandingPage from '../features/marketing/routes/LandingPage';
import DemoPlayer from '../features/spike/DemoPlayer';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<DemoPlayer />} />
        <Route path="/auth/success" element={<AuthSuccessPage />} />
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
