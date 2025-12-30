'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { useUser } from '@/hooks/useUser';
import { reportsApi } from '@/lib/api';
import NavigationBar from '@/components/NavigationBar';
import Link from 'next/link';

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
  updated_at: string;
}

export default function ReportsManagementPage() {
  const { theme } = useTheme();
  const { currentUser, loading: userLoading } = useUser();
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'performance' as const,
    period: 'monthly' as const,
    department: '',
    employee_id: '',
    summary: '',
  });

  // Redirect jika tidak supervisor
  useEffect(() => {
    if (!userLoading && (!currentUser || currentUser.role !== 'supervisor')) {
      router.push('/');
    }
  }, [currentUser, userLoading, router]);

  // Load reports
  useEffect(() => {
    if (currentUser?.role === 'supervisor') {
      loadReports();
    }
  }, [currentUser]);

  const loadReports = async () => {
    try {
      const data = await reportsApi.getAll();
      setReports(data);
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
      if (formData.department) formDataObj.append('department', formData.department);
      if (formData.employee_id) formDataObj.append('employee_id', formData.employee_id);
      if (formData.summary) formDataObj.append('summary', formData.summary);
      if (selectedFile) formDataObj.append('file', selectedFile);

      if (editingId) {
        await reportsApi.updateWithFile(editingId, formDataObj);
      } else {
        await reportsApi.createWithFile(formDataObj);
      }

      // Reset form
      setFormData({
        title: '',
        type: 'performance',
        period: 'monthly',
        department: '',
        employee_id: '',
        summary: '',
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

  const themeColors = useMemo(() => {
    return theme.isDayTime ? {
      bg: 'bg-white',
      text: 'text-gray-900',
      textLight: 'text-gray-600',
      textLighter: 'text-gray-400',
      border: 'border-gray-200',
      bgLight: 'bg-gray-50',
      cardBg: 'bg-white',
      shadow: 'shadow-md',
      heroOverlay: 'bg-white/70'
    } : {
      bg: 'bg-gray-900',
      text: 'text-gray-100',
      textLight: 'text-gray-300',
      textLighter: 'text-gray-400',
      border: 'border-gray-700',
      bgLight: 'bg-gray-800',
      cardBg: 'bg-gray-800',
      shadow: 'shadow-lg shadow-black/20',
      heroOverlay: 'bg-gray-900/70'
    };
  }, [theme.isDayTime]);

  if (!currentUser) return null;

  return (
    <>
      <div className="relative h-64 md:h-80 flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: `url("${theme.backgroundImage}")`,
        }}
      >
        <div className={`absolute inset-0 ${themeColors.heroOverlay}`} />
        <div className="relative z-10 text-center px-4 w-full">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${themeColors.text}`}>
            Reports <span className="text-blue-600">Management</span>
          </h1>
          <p className={`text-lg md:text-xl ${themeColors.textLight} max-w-3xl mx-auto`}>
            Upload and manage company reports (PDF files)
          </p>
        </div>
      </div>

      <div className={`min-h-screen ${themeColors.bg}`}>
        <NavigationBar />

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                    Dashboard
                  </Link>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-500">/</span>
                    <span className={`${themeColors.text} font-medium`}>Reports Management</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Form */}
            <div className={`lg:col-span-1 ${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6`}>
              <h3 className={`text-lg font-semibold ${themeColors.text} mb-6`}>
                {editingId ? 'Edit Report' : 'Upload Report'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>Title</label>
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
                  <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg bg-transparent ${themeColors.text}`}
                  >
                    <option value="performance">Performance</option>
                    <option value="attendance">Attendance</option>
                    <option value="productivity">Productivity</option>
                    <option value="department">Department</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>Period</label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                    className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg bg-transparent ${themeColors.text}`}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>Summary</label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Brief summary of the report"
                    rows={3}
                    className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg bg-transparent ${themeColors.text}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>PDF File</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg bg-transparent ${themeColors.text}`}
                  />
                  {selectedFile && <p className="text-sm text-green-600 mt-1">Selected: {selectedFile.name}</p>}
                </div>

                <button
                  type="submit"
                  disabled={uploading || !formData.title || !selectedFile && !editingId}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : editingId ? 'Update' : 'Upload'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        title: '',
                        type: 'performance',
                        period: 'monthly',
                        department: '',
                        employee_id: '',
                        summary: '',
                      });
                      setSelectedFile(null);
                    }}
                    className="w-full px-4 py-2 border border-gray-400 rounded-lg hover:bg-gray-100"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>

            {/* Reports List */}
            <div className={`lg:col-span-2 ${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6`}>
              <h3 className={`text-lg font-semibold ${themeColors.text} mb-6`}>All Reports</h3>

              {loading ? (
                <p className={themeColors.textLight}>Loading...</p>
              ) : reports.length === 0 ? (
                <p className={themeColors.textLight}>No reports yet</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {reports.map((report) => (
                    <div key={report.id} className={`border ${themeColors.border} rounded-lg p-4`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className={`font-medium ${themeColors.text}`}>{report.title}</h4>
                          <p className={`text-sm ${themeColors.textLight}`}>
                            {report.type} • {report.period}
                          </p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {report.type}
                        </span>
                      </div>

                      {report.summary && (
                        <p className={`text-sm ${themeColors.textLight} mb-3`}>{report.summary}</p>
                      )}

                      <div className="flex gap-2 text-sm">
                        {report.file_path && (
                          <button
                            onClick={() => handleDownload(report)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Download
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingId(report.id);
                            setFormData({
                              title: report.title,
                              type: report.type,
                              period: report.period,
                              department: report.department || '',
                              employee_id: report.employee_id?.toString() || '',
                              summary: report.summary || '',
                            });
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
