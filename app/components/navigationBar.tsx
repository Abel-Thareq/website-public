"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function NavigationBar() {
  const pathname = usePathname();
  
  const tabs = [
    { id: "dashboard", name: "Dashboard", path: "/", icon: "📊" },
    { id: "attendance", name: "Attendance", path: "/attendance", icon: "⏰" },
    { id: "tasks", name: "Tasks", path: "/tasks", icon: "✅" },
    { id: "reports", name: "Reports", path: "/reports", icon: "📈" },
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-200">
                <Image
                  src="/logo TechMaven.png"
                  alt="TechMaven Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TechMedia TechMaven Portal</h1>
                <p className="text-sm text-gray-500">Employee Monitoring System • Est. 2025</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-2 text-sm">
              {tabs.map((tab) => {
                const isActive = pathname === tab.path;
                return (
                  <Link
                    key={tab.id}
                    href={tab.path}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? "bg-blue-100 text-blue-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-full hover:bg-gray-100">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                TM
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4">
          <div className="flex justify-around bg-gray-50 rounded-lg p-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.path;
              return (
                <Link
                  key={tab.id}
                  href={tab.path}
                  className={`flex flex-col items-center justify-center px-3 py-2 rounded-md text-sm transition-all ${
                    isActive
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="text-lg mb-1">{tab.icon}</span>
                  <span className="text-xs">{tab.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}