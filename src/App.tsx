import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { isFirebaseConfigured } from './services/firebase';
import { useAuthViewModel } from './viewmodels/AuthViewModel';
import ProtectedRoute from './views/components/ProtectedRoute';
import AdminLayout from './views/components/AdminLayout';
import LoginPage from './views/auth/LoginPage';
import SetupPage from './views/auth/SetupPage';
import DashboardPage from './views/dashboard/DashboardPage';
import UserListPage from './views/users/UserListPage';
import UserDetailPage from './views/users/UserDetailPage';
import ActivityPage from './views/activities/ActivityPage';
import FoodPage from './views/foods/FoodPage';

function AppRoutes() {
  const { user, isAdmin, loading } = useAuthViewModel();

  if (!isFirebaseConfigured()) {
    return <SetupPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user && isAdmin ? <AdminLayout><DashboardPage /></AdminLayout> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout><DashboardPage /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <AdminLayout><UserListPage /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:userId"
        element={
          <ProtectedRoute>
            <AdminLayout><UserDetailPage /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/foods"
        element={
          <ProtectedRoute>
            <AdminLayout><FoodPage /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/activities"
        element={
          <ProtectedRoute>
            <AdminLayout><ActivityPage /></AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
