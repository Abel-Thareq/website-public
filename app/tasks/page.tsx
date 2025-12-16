import NavigationBar from "../components/navigationBar";
import Link from "next/link";

export default function TasksPage() {
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
            Task <span className="text-blue-600">Management</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Track, assign, and manage team tasks efficiently
          </p>
        </div>
      </div>

      <div className="min-h-screen bg-white">
        <NavigationBar />
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
                <p className="text-gray-600 mt-1">Manage and track all team tasks</p>
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
          
          {/* Tasks Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Task Management System</h3>
              <p className="text-gray-600">This page would show task lists, assignments, deadlines, and progress tracking.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}