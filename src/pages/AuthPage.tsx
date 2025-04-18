
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { useAuth } from '@/contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

const AuthPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token') || '';
  
  const [mode, setMode] = useState<AuthMode>(() => {
    if (searchParams.has('token') && searchParams.get('action') === 'reset-password') {
      return 'reset-password';
    }
    return 'login';
  });

  // Redirect to dashboard if user is already authenticated
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mx-auto text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900">Auth System</h1>
          <p className="text-muted-foreground mt-2">Secure & Optimized Authentication</p>
        </div>

        {mode === 'login' && (
          <LoginForm
            onRegister={() => setMode('register')}
            onForgotPassword={() => setMode('forgot-password')}
          />
        )}

        {mode === 'register' && (
          <RegisterForm
            onLogin={() => setMode('login')}
          />
        )}

        {mode === 'forgot-password' && (
          <ForgotPasswordForm
            onBackToLogin={() => setMode('login')}
          />
        )}

        {mode === 'reset-password' && resetToken && (
          <ResetPasswordForm
            token={resetToken}
            onSuccess={() => setMode('login')}
          />
        )}

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </div>
  );
};

export default AuthPage;
