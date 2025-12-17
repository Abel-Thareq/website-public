"use client";

import { useState, useEffect, useMemo } from "react";
import NavigationBar from "../components/navigationBar";
import Link from "next/link";
import { User, Report } from "../types/user";

// Icon Components
const ChartBarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function ReportsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any>(null);

  // Load current user
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }
  }, []);

  // Generate report data based on role
  const reportsData = useMemo(() => {
    if (!currentUser) return [];

    const reports: Report[] = [];
    
    if (currentUser.role === 'employee') {
      // Reports untuk employee (performance pribadi)
      reports.push(
        {
          id: 1,
          title: "Monthly Performance Report - December 2023",
          type: "performance",
          period: "monthly",
          generatedDate: "2023-12-16",
          employeeName: currentUser.name,
          downloadUrl: "#",
          summary: "Your performance metrics for December 2023 show excellent results with 95% task completion rate."
        },
        {
          id: 2,
          title: "Quarterly Review - Q4 2023",
          type: "performance",
          period: "quarterly",
          generatedDate: "2023-12-10",
          employeeName: currentUser.name,
          downloadUrl: "#",
          summary: "Q4 performance review showing consistent improvement and achievement of all targets."
        },
        {
          id: 3,
          title: "Attendance Summary - November 2023",
          type: "attendance",
          period: "monthly",
          generatedDate: "2023-11-30",
          employeeName: currentUser.name,
          downloadUrl: "#",
          summary: "Perfect attendance record for November with zero late arrivals."
        },
        {
          id: 4,
          title: "Task Completion Analysis - Last 90 Days",
          type: "productivity",
          period: "quarterly",
          generatedDate: "2023-12-15",
          employeeName: currentUser.name,
          downloadUrl: "#",
          summary: "Analysis of task completion patterns and productivity trends over the last quarter."
        }
      );
    } else if (currentUser.role === 'pm') {
      // Reports untuk PM (Engineering department)
      reports.push(
        {
          id: 1,
          title: "Engineering Department Performance - December 2023",
          type: "department",
          period: "monthly",
          generatedDate: "2023-12-16",
          department: "Engineering",
          downloadUrl: "#",
          summary: "Overall department performance showing 91.2% completion rate and excellent team collaboration."
        },
        {
          id: 2,
          title: "Team Productivity Report - Q4 2023",
          type: "productivity",
          period: "quarterly",
          generatedDate: "2023-12-10",
          department: "Engineering",
          downloadUrl: "#",
          summary: "Detailed analysis of team productivity metrics and individual contributions."
        },
        {
          id: 3,
          title: "Engineering Attendance Analysis - Weekly",
          type: "attendance",
          period: "weekly",
          generatedDate: "2023-12-15",
          department: "Engineering",
          downloadUrl: "#",
          summary: "Weekly attendance patterns showing 94% on-time rate across the team."
        },
        {
          id: 4,
          title: "Project Milestone Report - December 2023",
          type: "performance",
          period: "monthly",
          generatedDate: "2023-12-14",
          department: "Engineering",
          downloadUrl: "#",
          summary: "Progress report on key project milestones and deliverables for December."
        }
      );
    } else {
      // Reports untuk supervisor (semua departemen)
      reports.push(
        {
          id: 1,
          title: "Company Performance Overview - December 2023",
          type: "performance",
          period: "monthly",
          generatedDate: "2023-12-16",
          downloadUrl: "#",
          summary: "Comprehensive company-wide performance metrics showing 87.5% overall achievement."
        },
        {
          id: 2,
          title: "Department Comparison Report - Q4 2023",
          type: "department",
          period: "quarterly",
          generatedDate: "2023-12-12",
          downloadUrl: "#",
          summary: "Comparative analysis of all departments showing Engineering leads with 91.2% performance."
        },
        {
          id: 3,
          title: "Company Attendance Dashboard - Weekly",
          type: "attendance",
          period: "weekly",
          generatedDate: "2023-12-15",
          downloadUrl: "#",
          summary: "Weekly attendance trends across all departments with 89% on-time average."
        },
        {
          id: 4,
          title: "Productivity Analysis - November 2023",
          type: "productivity",
          period: "monthly",
          generatedDate: "2023-12-01",
          downloadUrl: "#",
          summary: "Detailed productivity metrics showing 15% improvement compared to previous month."
        }
      );
    }
    
    return reports;
  }, [currentUser]);

  // Filter reports
  const filteredReports = useMemo(() => {
    let filtered = reportsData;
    
    if (selectedReportType !== "all") {
      filtered = filtered.filter(report => report.type === selectedReportType);
    }
    
    if (selectedPeriod !== "all") {
      filtered = filtered.filter(report => report.period === selectedPeriod);
    }
    
    return filtered;
  }, [reportsData, selectedReportType, selectedPeriod]);

  // Generate sample chart data
  const chartData = useMemo(() => {
    if (currentUser?.role === 'employee') {
      return {
        labels: ['Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Task Completion Rate',
            data: [85, 88, 95],
            backgroundColor: '#3B82F6'
          }
        ]
      };
    } else if (currentUser?.role === 'pm') {
      return {
        labels: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'],
        datasets: [
          {
            label: 'Department Performance',
            data: [91.2, 85.4, 89.1, 82.3, 86.7],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
          }
        ]
      };
    } else {
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Overall Performance',
            data: [82, 85, 87, 89],
            backgroundColor: '#3B82F6'
          }
        ]
      };
    }
  }, [currentUser]);

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    
    // Simulate report generation
    setTimeout(() => {
      const newReport: Report = {
        id: reportsData.length + 1,
        title: `${selectedReportType === 'all' ? 'Custom' : selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} Report - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        type: selectedReportType === 'all' ? 'performance' : selectedReportType as any,
        period: selectedPeriod === 'all' ? 'monthly' : selectedPeriod as any,
        generatedDate: new Date().toISOString().split('T')[0],
        department: currentUser?.role === 'pm' ? currentUser.department : undefined,
        employeeName: currentUser?.role === 'employee' ? currentUser.name : undefined,
        downloadUrl: "#",
        summary: "Newly generated report with latest data and analytics."
      };
      
      setReportData(newReport);
      setGeneratingReport(false);
    }, 2000);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Please login to view reports</h2>
          </div>
        </div>
      </div>
    );
  }

  // Employee tidak punya akses ke reports page
  if (currentUser.role === 'employee') {
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
              Performance <span className="text-blue-600">Reports</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
              Your personal performance analytics and reports
            </p>
          </div>
        </div>

        <div className="min-h-screen bg-gray-50">
          <NavigationBar />
          
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <nav className="flex mb-4" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                      <li className="inline-flex items-center">
                        <Link href="/" className="text-gray-700 hover:text-blue-600">
                          Dashboard
                        </Link>
                      </li>
                      <li aria-current="page">
                        <div className="flex items-center">
                          <span className="mx-2 text-gray-500">/</span>
                          <span className="text-gray-900 font-medium">Reports</span>
                        </div>
                      </li>
                    </ol>
                  </nav>
                  
                  <h2 className="text-2xl font-bold text-gray-900">My Performance Reports</h2>
                  <p className="text-gray-600 mt-1">View your personal performance analytics</p>
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
            
            {/* Employee Reports Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">My Reports</h3>
                    <p className="text-sm text-gray-600">Access your performance reports and analytics</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {reportsData.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <ChartBarIcon />
                        </div>
                        <span className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          {report.period}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-medium text-gray-900 mb-2">{report.title}</h4>
                      <p className="text-sm text-gray-600 mb-4">{report.summary}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Generated: {new Date(report.generatedDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                          <DownloadIcon />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Performance Charts untuk Employee */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Trend</h3>
                    <div className="h-64 flex items-end gap-4">
                      {chartData.labels.map((label, index) => (
                        <div key={label} className="flex-1 flex flex-col items-center">
                          <div className="text-xs text-gray-500 mb-2">{label}</div>
                          <div 
                            className="w-12 bg-blue-500 rounded-t"
                            style={{ height: `${chartData.datasets[0].data[index]}%` }}
                          />
                          <div className="text-sm font-medium mt-2">{chartData.datasets[0].data[index]}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Task Completion Rate</span>
                        <span className="font-semibold">95%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">On Time Delivery</span>
                        <span className="font-semibold text-green-600">92%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Quality Rating</span>
                        <span className="font-semibold">4.7/5.0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Peer Feedback</span>
                        <span className="font-semibold">4.9/5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

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
            {currentUser.role === 'supervisor' ? 'Analytics & ' : ''}<span className="text-blue-600">Reports</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            {currentUser.role === 'supervisor' 
              ? 'Comprehensive analytics and reporting for company performance'
              : `${currentUser.department} department analytics and performance reports`}
          </p>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header dengan Breadcrumb */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <nav className="flex mb-4" aria-label="Breadcrumb">
                  <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                      <Link href="/" className="text-gray-700 hover:text-blue-600">
                        Dashboard
                      </Link>
                    </li>
                    <li aria-current="page">
                      <div className="flex items-center">
                        <span className="mx-2 text-gray-500">/</span>
                        <span className="text-gray-900 font-medium">Reports</span>
                      </div>
                    </li>
                  </ol>
                </nav>
                
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentUser.role === 'supervisor' 
                    ? 'Company Analytics Dashboard'
                    : `${currentUser.department} Department Reports`}
                </h2>
                <p className="text-gray-600 mt-1">
                  {currentUser.role === 'supervisor' 
                    ? 'Generate and analyze comprehensive performance reports'
                    : 'Track department performance and generate detailed reports'}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link 
                  href="/"
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
          
          {/* Report Generation Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Generate New Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <select
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Report Types</option>
                  <option value="performance">Performance</option>
                  <option value="attendance">Attendance</option>
                  <option value="productivity">Productivity</option>
                  <option value="department">Department Analysis</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Periods</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generatingReport ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <ChartBarIcon />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {reportData && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-green-800">Report Generated Successfully!</h4>
                    <p className="text-sm text-green-600 mt-1">{reportData.title}</p>
                  </div>
                  <button className="flex items-center gap-2 text-green-700 hover:text-green-900">
                    <DownloadIcon />
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Available Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Available Reports</h3>
                  <p className="text-sm text-gray-600">
                    {currentUser.role === 'supervisor' 
                      ? 'Company-wide performance and analytics reports'
                      : `Pre-generated ${currentUser.department} department reports`}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Last updated: Today, 10:45 AM
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors hover:shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${
                        report.type === 'performance' ? 'bg-blue-50' :
                        report.type === 'attendance' ? 'bg-green-50' :
                        report.type === 'productivity' ? 'bg-amber-50' : 'bg-purple-50'
                      }`}>
                        <ChartBarIcon />
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                        report.type === 'performance' ? 'bg-blue-100 text-blue-800' :
                        report.type === 'attendance' ? 'bg-green-100 text-green-800' :
                        report.type === 'productivity' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {report.type}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{report.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{report.summary}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarIcon />
                        {new Date(report.generatedDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <DownloadIcon />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredReports.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No reports found</h3>
                  <p className="mt-1 text-gray-500">Try adjusting your filters or generate a new report</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Analytics Dashboard */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Analytics Dashboard</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Performance Chart */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  {currentUser.role === 'supervisor' 
                    ? 'Company Performance Trend'
                    : `${currentUser.department} Performance Trend`}
                </h4>
                <div className="h-64 flex items-end gap-4">
                  {chartData.labels.map((label, index) => (
                    <div key={label} className="flex-1 flex flex-col items-center">
                      <div className="text-xs text-gray-500 mb-2">{label}</div>
                      <div 
                        className={`w-12 rounded-t ${
                          currentUser.role === 'supervisor' ? 'bg-blue-500' :
                          currentUser.role === 'pm' ? Array.isArray(chartData.datasets[0].backgroundColor) 
                            ? chartData.datasets[0].backgroundColor[index] 
                            : chartData.datasets[0].backgroundColor
                          : 'bg-blue-500'
                        }`}
                        style={{ height: `${chartData.datasets[0].data[index]}%` }}
                      />
                      <div className="text-sm font-medium mt-2">{chartData.datasets[0].data[index]}%</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Key Metrics */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Key Performance Indicators</h4>
                <div className="space-y-4">
                  {currentUser.role === 'supervisor' ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Overall Performance</span>
                        <span className="font-semibold">87.5%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Attendance Rate</span>
                        <span className="font-semibold text-green-600">89%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Task Completion</span>
                        <span className="font-semibold">85.2%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Employee Satisfaction</span>
                        <span className="font-semibold">4.2/5.0</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Department Performance</span>
                        <span className="font-semibold">91.2%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">On Time Delivery</span>
                        <span className="font-semibold text-green-600">94%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Code Quality</span>
                        <span className="font-semibold">4.8/5.0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Team Collaboration</span>
                        <span className="font-semibold">4.7/5.0</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Export Options */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Export Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Export as PDF</div>
                  <div className="text-sm text-gray-600 mt-1">Generate downloadable PDF report</div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Export as Excel</div>
                  <div className="text-sm text-gray-600 mt-1">Download data in Excel format</div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Share Dashboard</div>
                  <div className="text-sm text-gray-600 mt-1">Share live dashboard with stakeholders</div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}