import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { Dashboard } from '@/pages/dashboard';
import Realms from '@/pages/Realms';
import RealmCanvas from '@/pages/RealmCanvas';
import { AuthProvider, useAuth } from '@/lib/auth';
import { LoginForm } from '@/components/auth/LoginForm';

function AppContent() {
  const { isAuthenticated, isAuthEnabled } = useAuth();

  if (isAuthEnabled && !isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/realms" element={<Realms />} />
          <Route path="/canvas" element={<RealmCanvas />} />
          <Route path="/policies" element={<div className="p-6">Policies Page (Coming Soon)</div>} />
          <Route path="/services" element={<div className="p-6">Services Page (Coming Soon)</div>} />
          <Route path="/network" element={<div className="p-6">Network Page (Coming Soon)</div>} />
          <Route path="/monitoring" element={<div className="p-6">Monitoring Page (Coming Soon)</div>} />
          <Route path="/access" element={<div className="p-6">Access Control Page (Coming Soon)</div>} />
          <Route path="/users" element={<div className="p-6">Users Page (Coming Soon)</div>} />
          <Route path="/analytics" element={<div className="p-6">Analytics Page (Coming Soon)</div>} />
          <Route path="/settings" element={<div className="p-6">Settings Page (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;