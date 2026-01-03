'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../providers/temaProvider';
import { useUser } from '../providers/userProvider';
import { reportsApi } from '@/lib/api';
import NavigationBar from '../components/navigationBar';

interface Report {
  id: number;
  title: string;
  type: 'performance' | 'attendance' | 'productivity' | 'department';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  summary?: string;
  department?: string;
  employee_id?: number;
  generated_by: number;
  file_path?: string;
  download_url?: string;
  created_at: string;
  generatedDate?: string;
  employeeName?: string;
}

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

const DeleteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

export default function ReportsPage() {
  const { theme } = useTheme();
  const { currentUser, loading: userLoading } = useUser();
  const router = useRouter();

  // Data states
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload states (supervisor only)
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    type: 'performance' | 'attendance' | 'productivity' | 'department';
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    summary: string;
    department?: string;
    employee_id?: string;
  }>({
    title: '',
    type: 'performance',
    period: 'monthly',
    summary: '',
    department: '',
    employee_id: '',
  });

  // Filter states
  const [selectedReportType, setSelectedReportType] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push('/');
    }
  }, [currentUser, userLoading, router]);

  // Load reports
  useEffect(() => {
    if (currentUser) {
      loadReports();
    }
  }, [currentUser]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportsApi.getAll();
      setReports(
        data.map((r: any) => ({
          ...r,
          generatedDate: r.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        }))
      );
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('type', formData.type);
      formDataObj.append('period', formData.period);
      if (formData.summary) formDataObj.append('summary', formData.summary);
      if (formData.department) formDataObj.append('department', formData.department);
      if (formData.employee_id) formDataObj.append('employee_id', formData.employee_id);
      if (selectedFile) formDataObj.append('file', selectedFile);

      if (editingId) {
        await reportsApi.updateWithFile(editingId, formDataObj);
      } else {
        if (!selectedFile) {
          alert('Please select a file');
          setUploading(false);
          return;
        }
        await reportsApi.createWithFile(formDataObj);
      }

      // Reset form
      setFormData({
        title: '',
        type: 'performance',
        period: 'monthly',
        summary: '',
        department: '',
        employee_id: '',
      });
      setSelectedFile(null);
      setEditingId(null);

      // Reload reports
      await loadReports();
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Error saving report');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this report?')) return;

    try {
      await reportsApi.delete(id);
      await loadReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Error deleting report');
    }
  };

  const handleDownload = async (report: Report) => {
    if (!report.file_path) {
      alert('No file attached to this report');
      return;
    }

    try {
      const blob = await reportsApi.download(report.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report');
    }
  };

  const filteredReports = useMemo(() => {
    let filtered = reports;

    if (selectedReportType !== 'all') {
      filtered = filtered.filter((report) => report.type === selectedReportType);
    }

    if (selectedPeriod !== 'all') {
      filtered = filtered.filter((report) => report.period === selectedPeriod);
    }

    return filtered;
  }, [reports, selectedReportType, selectedPeriod]);

  const themeColors = useMemo(() => {
    return theme.isDayTime
      ? {
          bg: 'bg-white',
          text: 'text-gray-900',
          textLight: 'text-gray-600',
          textLighter: 'text-gray-400',
          border: 'border-gray-200',
          bgLight: 'bg-gray-50',
          cardBg: 'bg-white',
          shadow: 'shadow-md',
          heroOverlay: 'bg-white/70',
        }
      : {
          bg: 'bg-gray-900',
          text: 'text-gray-100',
          textLight: 'text-gray-300',
          textLighter: 'text-gray-400',
          border: 'border-gray-700',
          bgLight: 'bg-gray-800',
          cardBg: 'bg-gray-800',
          shadow: 'shadow-lg shadow-black/20',
          heroOverlay: 'bg-gray-900/70',
        };
  }, [theme.isDayTime]);

  if (!currentUser) return null;

  return (
    <>
      <div
        className="relative h-64 md:h-80 flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url("${theme.backgroundImage}")` }}
      >
        <div className={`absolute inset-0 ${themeColors.heroOverlay}`} />
        <div className="relative z-10 text-center px-4 w-full">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${themeColors.text}`}>
            {currentUser.role === 'supervisor' ? 'Analytics & ' : ''}
            <span className="text-blue-600">Reports</span>
          </h1>
          <p className={`text-lg md:text-xl ${themeColors.textLight} max-w-3xl mx-auto`}>
            {currentUser.role === 'supervisor'
              ? 'Upload and manage company reports'
              : 'View performance reports and analytics'}
          </p>
        </div>
      </div>

      <div className={`min-h-screen ${themeColors.bg}`}>
        <NavigationBar />

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Supervisor Upload Section */}
          {currentUser.role === 'supervisor' && (
            <div
              className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} p-8 mb-8 hover-lift group overflow-hidden relative`}
            >
              {/* Background decorative blur */}
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-10 group-hover:opacity-20 transition-opacity"></div>
              
              <h3 className={`text-xl font-bold ${themeColors.text} mb-8 relative z-10`}>
                {editingId ? 'Edit Report' : '📄 Upload New Report'}
              </h3>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div>
                  <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Report title"
                    className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg bg-transparent ${themeColors.text}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg bg-transparent ${themeColors.text}`}
                  >
                    <option value="performance">Performance</option>
                    <option value="attendance">Attendance</option>
                    <option value="productivity">Productivity</option>
                    <option value="department">Department</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>
                    Period
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) =>
                      setFormData({ ...formData, period: e.target.value as any })
                    }
                    className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg bg-transparent ${themeColors.text}`}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>
                    Department (For Department Reports)
                  </label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Engineering, Marketing"
                    className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg bg-transparent ${themeColors.text}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>
                    PDF File
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg bg-transparent ${themeColors.text}`}
                  />
                  {selectedFile && (
                    <p className="text-sm text-green-600 mt-1">Selected: {selectedFile.name}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>
                    Summary
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData({ ...formData, summary: e.target.value })
                    }
                    placeholder="Brief summary of the report"
                    rows={2}
                    className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg bg-transparent ${themeColors.text}`}
                  />
                </div>

                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={uploading || !formData.title || (!selectedFile && !editingId)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 font-medium shadow-md hover:shadow-lg"
                  >
                    {uploading ? 'Uploading...' : editingId ? 'Update Report' : 'Upload Report'}
                  </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setFormData({
                            title: '',
                            type: 'performance',
                            period: 'monthly',
                            summary: '',
                            department: '',
                            employee_id: '',
                          });
                          setSelectedFile(null);
                        }}
                        className={`px-4 py-2 border ${themeColors.border} rounded-lg hover:${themeColors.bgLight}`}
                      >
                        Cancel
                      </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div
            className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} p-8 mb-8 hover-lift group overflow-hidden relative`}
          >
            {/* Background decorative blur */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-10 group-hover:opacity-20 transition-opacity"></div>
            
            <h3 className={`text-xl font-bold ${themeColors.text} mb-6 relative z-10`}>🔍 Search & Filter</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div>
                <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>
                  Report Type
                </label>
                <select
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg bg-transparent ${themeColors.text}`}
                >
                  <option value="all">All Types</option>
                  <option value="performance">Performance</option>
                  <option value="attendance">Attendance</option>
                  <option value="productivity">Productivity</option>
                  <option value="department">Department</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>
                  Period
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg bg-transparent ${themeColors.text}`}
                >
                  <option value="all">All Periods</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div
            className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} p-8 overflow-hidden`}
          >
            <h3 className={`text-xl font-bold ${themeColors.text} mb-8`}>
              {currentUser.role === 'supervisor' ? '📊 All Reports' : '📑 Available Reports'}
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className={themeColors.textLight}>Loading reports...</p>
                </div>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className={`text-lg ${themeColors.textLight} mb-2`}>
                    {currentUser.role === 'supervisor'
                      ? '📭 No reports uploaded yet. Create your first report above.'
                      : '📭 No reports available yet.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className={`border ${themeColors.border} rounded-2xl p-6 hover-lift group overflow-hidden relative`}
                  >
                    {/* Background blur effect */}
                    <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className={`font-bold ${themeColors.text} line-clamp-2 text-lg`}>
                            {report.title}
                          </h4>
                          <p className={`text-sm ${themeColors.textLight} mt-2 flex items-center gap-2`}>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {report.type}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {report.period}
                            </span>
                          </p>
                        </div>
                      </div>

                      {report.summary && (
                        <p className={`text-sm ${themeColors.textLight} mb-4 line-clamp-2`}>
                          {report.summary}
                        </p>
                      )}

                      <div className={`text-xs ${themeColors.textLighter} mb-4 font-medium`}>
                        📅 {new Date(report.generatedDate || report.created_at).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </div>

                      <div className="flex gap-3 text-sm flex-wrap">
                        {report.file_path && (
                          <button
                            onClick={() => handleDownload(report)}
                            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline transition-colors"
                          >
                            <DownloadIcon />
                            Download
                          </button>
                        )}
                        {currentUser.role === 'supervisor' && (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(report.id);
                                setFormData({
                                  title: report.title,
                                  type: report.type as 'performance' | 'attendance' | 'productivity' | 'department',
                                  period: report.period as 'daily' | 'weekly' | 'monthly' | 'quarterly',
                                  summary: report.summary || '',
                                  department: report.department || '',
                                  employee_id: report.employee_id ? String(report.employee_id) : '',
                                });
                                // Scroll to form
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline transition-colors"
                            >
                              <EditIcon />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(report.id)}
                              className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1 hover:underline transition-colors"
                            >
                              <DeleteIcon />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
