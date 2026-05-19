import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import {
  login,
  logout,
  onAuthChange,
  isAdminEmail,
} from '../services/firebase';

export function useAuthViewModel() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        const admin = isAdminEmail(firebaseUser.email);
        setUser(firebaseUser);
        setIsAdmin(admin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    setError('');
    setLoading(true);
    try {
      const cred = await login(email, password);
      if (!isAdminEmail(cred.user.email)) {
        await logout();
        throw new Error('Bạn không có quyền truy cập trang quản trị.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đăng xuất thất bại.';
      setError(message);
    }
  }, []);

  return { user, isAdmin, loading, error, handleLogin, handleLogout };
}
