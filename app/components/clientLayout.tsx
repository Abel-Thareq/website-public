"use client";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '../providers/userProvider';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { currentUser, loading } = useUser();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for UserProvider to finish loading before making routing decisions.
    // This prevents flashing the wrong page while auth state is being determined.
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  useEffect(() => {
    if (!isReady) return;

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/attendance', '/tasks', '/reports', '/spk'];
    const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));

    // Use auth_token as single source of truth (not currentUser JSON which can go stale)
    const hasToken = !!localStorage.getItem('auth_token');

    // If logged in and on landing page, redirect to dashboard
    if (hasToken && currentUser && pathname === '/') {
      window.location.href = '/dashboard';
    }
    // If not logged in and on a protected route, redirect to home
    else if (!hasToken && isProtectedRoute) {
      window.location.href = '/';
    }
  }, [isReady, currentUser, pathname]);

  // Listen for logout events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' && e.newValue === null) {
        const protectedRoutes = ['/dashboard', '/attendance', '/tasks', '/reports', '/spk'];
        const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));
        if (isProtectedRoute) {
          window.location.href = '/';
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [pathname]);

  // Show loading spinner while checking auth
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}