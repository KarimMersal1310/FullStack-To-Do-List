import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TodoProvider } from './contexts/TodoContext';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { TodoDashboard } from './components/TodoDashboard';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (!isAuthenticated) {
    return (
      <>
        {showLogin ? (
          <LoginPage onSwitchToRegister={() => setShowLogin(false)} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setShowLogin(true)} />
        )}
      </>
    );
  }

  return (
    <TodoProvider>
      <TodoDashboard />
    </TodoProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
