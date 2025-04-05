import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProfileGeneral from './pages/profile/ProfileGeneral';
import ProfileConnectedAccounts from './pages/profile/ProfileConnectedAccounts';
import ProfileSecurity from './pages/profile/ProfileSecurity';
import ProfilePaymentMethods from './pages/profile/ProfilePaymentMethods';
import ProfileBalance from './pages/profile/ProfileBalance';
import Layout from './components/layout/Layout';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import VerifyCode from './pages/auth/VerifyCode';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0c0c0c]">
        {/* 🔥 Toast container global */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#161616',
              color: '#fff',
              border: '1px solid #3f3f3f',
              padding: '12px 16px',
              fontSize: '14px'
            }
          }}
        />

        <Routes>
          {/* Auth Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-code" element={<VerifyCode />} />

          {/* Default Route - Redirect to SignIn */}
          <Route path="/" element={<Navigate to="/signin" replace />} />

          {/* Protected Routes */}
          <Route path="/" element={<Layout />}>
            <Route path="/profile" element={<ProfileGeneral />} />
            <Route path="/profile-cuentas" element={<ProfileConnectedAccounts />} />
            <Route path="/profile-seguridad" element={<ProfileSecurity />} />
            <Route path="/profile-formas-de-pago" element={<ProfilePaymentMethods />} />
            <Route path="/profile-saldo" element={<ProfileBalance />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
