import NavigationBar from "../components/navigationBar";
import Link from "next/link";

export default function AttendancePage() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: 'url("/background.jpg")',
        }}
      >
        <div className="absolute inset-0 bg-white/70" />
        
        <div className="relative z-10 text-center px-4 w-full">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Attendance <span className="text-blue-600">Management</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Real-time tracking and monitoring of employee attendance records
          </p>
        </div>
      </div>

      <div className="min-h-screen bg-white">
        <NavigationBar />
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Attendance Dashboard</h2>
                <p className="text-gray-600 mt-1">Track employee attendance here</p>
              </div>
              
              <div className="flex gap-3">
                <Link 
                  href="/"
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
          
          {/* Attendance Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Attendance Management System</h3>
              <p className="text-gray-600">This page would show detailed attendance reports, charts, and employee check-in/out data.</p>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600">Total Check-ins Today</p>
                  <p className="text-3xl font-bold text-blue-600">124</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600">On Time</p>
                  <p className="text-3xl font-bold text-green-600">89</p>
                </div>
                <div className="bg-amber-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600">Late Arrivals</p>
                  <p className="text-3xl font-bold text-amber-600">12</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}