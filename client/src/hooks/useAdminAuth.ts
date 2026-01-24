import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function useAdminAuth() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
    
    if (!isLoggedIn) {
      setLocation('/admin/login');
    }
  }, [setLocation]);

  return {
    isLoggedIn: localStorage.getItem('admin_logged_in') === 'true',
  };
}
