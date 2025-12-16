import NavigationBar from "../components/navigationBar";
import Link from "next/link";

export default function ReportsPage() {
  return (
    <>
      <div className="relative h-64 md:h-80 flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: 'url("/background.jpg")',
        }}
      >
        <div className="absolute inset-0 bg-white/70" />
        
        <div className="relative z-10 text-center px-4 w-full">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Analytics & <span className="text-blue-600">Reports</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Detailed insights and analytics for performance tracking
          </p>
        </div>
      </div>

      <div className="min-h-screen bg-white">
        <NavigationBar />
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Performance Reports</h2>
                <p className="text-gray-600 mt-1">Generate and analyze detailed reports</p>
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
          
          {/* Reports Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Reports & Analytics System</h3>
              <p className="text-gray-600">This page would show performance reports, charts, analytics, and export options.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}