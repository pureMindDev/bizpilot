import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { extractErrorMessage } from '../utils/apiError';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, if a token is stored, hydrate the user from the real API
  // instead of trusting stale localStorage data.
  useEffect(() => {
    const token = localStorage.getItem('bizpilot_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('bizpilot_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async ({ email, password }) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('bizpilot_token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      // EMAIL_NOT_VERIFIED is a distinct case the Login page needs to detect
      // and redirect from (not just display as a generic error).
      const error = new Error(extractErrorMessage(err));
      error.code = err.response?.data?.code;
      throw error;
    }
  };

  // Registration no longer logs the user in directly — the backend requires
  // email verification first. Returns the email so the caller can route to
  // the verify-email screen.
  const register = async ({ name, business, email, password, phone }) => {
    try {
      const res = await api.post('/auth/register', { name, business, email, password, phone });
      return { email: res.data.email, message: res.data.message };
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  };

  // Completes registration: checks the emailed code and, on success, fully
  // logs the user in (same as login()).
  const verifyEmail = async ({ email, code }) => {
    try {
      const res = await api.post('/auth/verify-email', { email, code });
      localStorage.setItem('bizpilot_token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  };

  const resendVerification = async (email) => {
    try {
      const res = await api.post('/auth/resend-verification', { email });
      return res.data.message;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  };

  const logout = () => {
    localStorage.removeItem('bizpilot_token');
    setUser(null);
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return res.data.message;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  };

  const resetPassword = async ({ email, password }) => {
    try {
      const res = await api.post('/auth/reset-password', { email, password });
      return res.data.message;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  };

  const changePassword = async ({ currentPassword, newPassword }) => {
    try {
      const res = await api.post('/auth/change-password', { currentPassword, newPassword });
      return res.data.message;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  };

  // Permanently deletes the current business and all its data, then logs out.
  const deleteAccount = async () => {
    try {
      const res = await api.delete('/business');
      logout();
      return res.data.message;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        changePassword,
        deleteAccount,
        verifyEmail,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
