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

  useEffect(() => {
    // Tunggu sebentar untuk memastikan DOM sudah siap
    const timer = setTimeout(() => {
      try {
        // Cek apakah user sudah login
        const savedUser = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        
        console.log('ClientLayout check:', {
          pathname,
          hasUser: !!savedUser,
          isDashboard: pathname?.startsWith('/dashboard')
        });
        
        // Jika user sudah login dan mencoba akses halaman utama, redirect ke dashboard
        if (savedUser && pathname === '/') {
          console.log('User sudah login, redirect ke dashboard...');
          router.push('/dashboard');
          return;
        }
        
        // Jika user belum login dan mencoba akses dashboard, redirect ke home
        if (!savedUser && pathname?.startsWith('/dashboard')) {
          console.log('User belum login, redirect ke home...');
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Error in ClientLayout:', error);
      } finally {
        setIsChecking(false);
      }
    }, 100); // Tunggu 100ms untuk memastikan localStorage sudah bisa diakses

    return () => clearTimeout(timer);
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