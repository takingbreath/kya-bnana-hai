import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import SignIn from './components/SignIn';
import Onboarding from './components/Onboarding';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pastel-orange border-r-transparent"></div>
    </div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Routes that redirect to onboarding if user hasn't completed it
const OnboardingCheckRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading, needsOnboarding } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pastel-orange border-r-transparent"></div>
    </div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" />;
  }

  return <>{children}</>;
};

const Router = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<SignIn />} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <OnboardingCheckRoute>
              <App />
            </OnboardingCheckRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Router; 