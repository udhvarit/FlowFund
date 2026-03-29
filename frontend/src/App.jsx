import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import SubmitExpense from './pages/SubmitExpense';
import Approvals from './pages/Approvals';
import Users from './pages/Users';
import Categories from './pages/Categories';
import ApprovalSequences from './pages/ApprovalSequences';
import ApprovalRules from './pages/ApprovalRules';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="expenses/new" element={<SubmitExpense />} />
        <Route path="approvals" element={
          <ProtectedRoute roles={['admin', 'manager']} >
            <Approvals />
          </ProtectedRoute>
        } />
        <Route path="users" element={
          <ProtectedRoute roles={['admin']} >
            <Users />
          </ProtectedRoute>
        } />
        <Route path="categories" element={
          <ProtectedRoute roles={['admin']} >
            <Categories />
          </ProtectedRoute>
        } />
        <Route path="approval-sequences" element={
          <ProtectedRoute roles={['admin']} >
            <ApprovalSequences />
          </ProtectedRoute>
        } />
        <Route path="approval-rules" element={
          <ProtectedRoute roles={['admin']} >
            <ApprovalRules />
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute roles={['admin']} >
            <Settings />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
