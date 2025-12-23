"use client";
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only check once on mount to avoid infinite redirect loops
    if (hasChecked) {
      setIsChecking(false);
      return;
    }

    // Tunggu sebentar untuk memastikan DOM sudah siap
    const timer = setTimeout(() => {
      try {
        // Cek apakah user sudah login
        const savedUser = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        
        // Protected routes - require authentication
        const protectedRoutes = ['/dashboard', '/attendance', '/tasks', '/reports'];
        const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));
        
        console.log('ClientLayout check:', {
          pathname,
          hasUser: !!savedUser,
          isProtectedRoute,
        });
        
        // Jika user sudah login dan mencoba akses halaman utama, redirect ke dashboard
        if (savedUser && pathname === '/') {
          console.log('User sudah login, redirect ke dashboard...');
          router.push('/dashboard');
        }
        // Jika user belum login dan mencoba akses protected route, redirect ke home
        else if (!savedUser && isProtectedRoute) {
          console.log('User belum login, redirect ke home dari:', pathname);
          router.push('/');
        }
      } catch (error) {
        console.error('Error in ClientLayout:', error);
      } finally {
        setIsChecking(false);
        setHasChecked(true);
      }
    }, 100); // Tunggu 100ms untuk memastikan localStorage sudah bisa diakses

    return () => clearTimeout(timer);
  }, [hasChecked, pathname, router]);

  // Listen for logout events from other tabs or the UserProvider
  useEffect(() => {
    const handleLogout = () => {
      const savedUser = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
      
      // Protected routes
      const protectedRoutes = ['/dashboard', '/attendance', '/tasks', '/reports'];
      const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));
      
      // If logout event fired and on protected route, redirect to home
      if (!savedUser && isProtectedRoute) {
        router.push('/');
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      // Detect when auth_token is removed in another tab
      if (e.key === 'auth_token' && e.newValue === null) {
        // Token was removed, check if on protected route
        const protectedRoutes = ['/dashboard', '/attendance', '/tasks', '/reports'];
        const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));
        
        if (isProtectedRoute) {
          router.push('/');
        }
      }
    };

    window.addEventListener('logout', handleLogout);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('logout', handleLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname, router]);

  // Tampilkan loading spinner saat checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}