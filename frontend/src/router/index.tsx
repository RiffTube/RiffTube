import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandingPage from '../features/marketing/routes/LandingPage';
import DemoPlayer from '../features/spike/DemoPlayer';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<DemoPlayer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
