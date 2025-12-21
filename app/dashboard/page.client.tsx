"use client";
import { useEffect, useState } from "react";
import { dashboardApi } from "../../lib/api";
import { useUser } from "../providers/userProvider";
import { useRouter } from "next/navigation";

export default function DashboardClient() {
  const { currentUser, loading } = useUser();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/');
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setDataLoading(true);
      const data = await dashboardApi.getData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setDataLoading(false);
    }
  };

  if (loading || dataLoading || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render dashboard dengan dashboardData
  return (
    <div>
      {/* Your existing dashboard JSX */}
    </div>
  );
}