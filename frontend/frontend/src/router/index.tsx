import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import AuthSuccessPage from '@/features/auth/components/AuthSuccessPage/AuthSuccessPage';
import RequireAuth from '@/features/auth/guards/RequireAuth';
import EditorPage from '@/features/editor/routes/EditorPage';
import LandingPage from '@/features/marketing/routes/LandingPage';
import StudioLayout from '@/features/studio/Layout/StudioLayout';
import CreateProjectPage from '@/features/studio/routes/CreateProjectPage';
import HomeDashboard from '@/features/studio/routes/HomeDashboard';

export const routes = createRoutesFromElements(
  <>
    <Route path="/" element={<LandingPage />} />
    <Route path="/auth/success" element={<AuthSuccessPage />} />

    {/* Protected studio area */}
    <Route element={<RequireAuth />}>
      <Route path="/dashboard" element={<StudioLayout />}>
        <Route index element={<HomeDashboard />} />
        <Route path="projects/new" element={<CreateProjectPage />} />
      </Route>
      <Route path="/dashboard/projects/:projectId" element={<EditorPage />} />
      <Route path="/studio" element={<StudioLayout />} />
    </Route>

    {/* Catch-all */}
    <Route path="*" element={<h1>404</h1>} />
  </>,
);

// A data router (rather than <BrowserRouter>) so pages can hold up navigation,
// which the editor does while it has unsaved changes.
const router = createBrowserRouter(routes);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
