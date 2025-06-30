import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandingPage from '../features/marketing/routes/LandingPage';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
