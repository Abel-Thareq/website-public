"use client";

import { useState, useEffect, useMemo } from "react";
import NavigationBar from "../components/navigationBar";
import Link from "next/link";
import { AttendanceRecord, User } from "../types/user";
import { useTheme } from "../providers/temaProvider";
import { useUser } from "../providers/userProvider";
import { useRouter } from "next/navigation";
import CameraCapture from "../components/cameraCapture";
import Image from "next/image";
import { attendanceApi } from "../../lib/api";

// Icon Components
const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserGroupIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 3.197v-1a6 6 0 00-4.5-5.803" />
  </svg>
);

const CameraIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

// Attendance Form Types
interface AttendanceFormData {
  checkIn?: string;
  checkOut?: string;
  eodReport: string;
  documentation: File | string | null;
  documentationType: 'camera' | 'upload' | 'none';
  isCheckIn: boolean;
}

export default function AttendancePage() {
  const { theme } = useTheme();
  const { currentUser, loading } = useUser();
  const router = useRouter();
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("today");
  
  // State untuk attendance form
  const [showAttendanceForm, setShowAttendanceForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<AttendanceFormData>({
    eodReport: '',
    documentation: null,
    documentationType: 'none',
    isCheckIn: true
  });
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // State untuk detail/documentation view
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  
  // State untuk attendance records
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  
  // State untuk status check in/out hari ini
  const [todayStatus, setTodayStatus] = useState<{
    hasCheckedIn: boolean;
    hasCheckedOut: boolean;
    todayRecord: AttendanceRecord | null;
  }>({
    hasCheckedIn: false,
    hasCheckedOut: false,
    todayRecord: null
  });

  // Redirect ke home jika user belum login (tapi tunggu loading selesai dulu!)
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/');
    }
  }, [currentUser, loading, router]);

  // Load attendance data dari API
  useEffect(() => {
    if (!currentUser) return;

    const loadAttendanceData = async () => {
      try {
        const response = await attendanceApi.getAll();
        const data = response.data || [];
        console.log('Raw API response count:', data.length);
        console.log('Raw API response sample (first 3):', data.slice(0, 3).map((r: any) => ({
          id: r.id,
          date: r.date,
          check_in: r.check_in,
          check_out: r.check_out,
          employee_id: r.employee_id,
          employee_name: r.employee_name,
          user_id: r.user_id
        })));
        
        // Transform snake_case to camelCase
        const transformedData = data.map((record: any) => ({
          id: record.id,
          userId: record.user_id,
          date: record.date ? record.date.split('T')[0] : record.date, // Extract just the date part (2025-12-23 from 2025-12-23T00:00:00.000000Z)
          checkIn: record.check_in,
          checkOut: record.check_out,
          status: record.status,
          lateMinutes: parseInt(record.late_minutes) || 0,
          workHours: parseFloat(record.work_hours) || 0,
          notes: record.notes,
          eodReport: record.eod_report,
          hasDocumentation: record.has_documentation,
          documentationFile: record.documentation_file,
          employeeId: record.employee_id,
          employeeName: record.employee_name,
          department: record.department,
        }));
        
        console.log('Loaded attendance data from API:', transformedData.length, 'records');
        console.log('Transformed data sample (first 3):', transformedData.slice(0, 3).map((r: AttendanceRecord) => ({
          id: r.id,
          date: r.date,
          checkIn: r.checkIn,
          checkOut: r.checkOut,
          employeeId: r.employeeId,
          employeeName: r.employeeName
        })));
        
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = transformedData.filter((r: AttendanceRecord) => r.date === today);
        console.log('Today records for', today, ':', todayRecords.map((r: AttendanceRecord) => ({
          id: r.id,
          date: r.date,
          employeeId: r.employeeId,
          employeeName: r.employeeName,
          checkIn: r.checkIn
        })));
        
        // Debug: Show unique dates and employeeIds in API response
        const uniqueDates = [...new Set(transformedData.map((r: AttendanceRecord) => r.date))].sort().slice(-5);
        const pmRecords = transformedData.filter((r: AttendanceRecord) => r.employeeId === 'pm');
        console.log('Last 5 unique dates in DB:', uniqueDates);
        console.log('Total records for user "pm":', pmRecords.length);
        console.log('PM records dates:', [...new Set(pmRecords.map((r: AttendanceRecord) => r.date))].sort());
        
        setAttendanceRecords(transformedData);
      } catch (error) {
        console.error('Error loading attendance data:', error);
        // Fallback ke empty array if error
        setAttendanceRecords([]);
      }
    };

    loadAttendanceData();
  }, [currentUser]);

  // Update status check in/out hari ini
  useEffect(() => {
    if (!currentUser || currentUser.role === 'supervisor') return;

    const today = new Date().toISOString().split('T')[0];
    
    // Find today's record - compare by date and employeeId (username)
    const todayRecord = attendanceRecords.find(record => {
      const isSameDay = record.date === today;
      const isSameEmployee = record.employeeId === currentUser.username;
      return isSameDay && isSameEmployee;
    });

    console.log('Today status check:', {
      today,
      currentUsername: currentUser.username,
      foundRecord: todayRecord ? {
        id: todayRecord.id,
        date: todayRecord.date,
        employeeId: todayRecord.employeeId,
        checkIn: todayRecord.checkIn,
        checkOut: todayRecord.checkOut
      } : null
    });

    // Check if has check in (any value that's not empty/null)
    const hasCheckedIn = !!todayRecord?.checkIn;
    // Check if has check out (any value that's not empty/null)
    const hasCheckedOut = !!todayRecord?.checkOut;

    setTodayStatus({
      hasCheckedIn,
      hasCheckedOut,
      todayRecord: todayRecord || null
    });

    // Update form data based on status
    if (todayRecord) {
      setFormData(prev => ({
        ...prev,
        isCheckIn: false, // If record exists, ready for check out
        checkIn: todayRecord.checkIn || undefined,
        checkOut: todayRecord.checkOut || undefined,
        eodReport: todayRecord.eodReport || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        isCheckIn: true, // No record yet, ready for check in
        checkIn: undefined,
        checkOut: undefined,
        eodReport: ''
      }));
    }
  }, [attendanceRecords, currentUser]);

  // Theme colors berdasarkan tema
  const themeColors = useMemo(() => {
    return theme.isDayTime ? {
      bg: "bg-white",
      text: "text-gray-900",
      textLight: "text-gray-600",
      textLighter: "text-gray-500",
      border: "border-gray-200",
      borderLight: "border-gray-100",
      bgLight: "bg-gray-50",
      cardBg: "bg-white",
      shadow: "shadow-sm",
      heroOverlay: "bg-white/70"
    } : {
      bg: "bg-gray-900",
      text: "text-gray-100",
      textLight: "text-gray-300",
      textLighter: "text-gray-400",
      border: "border-gray-700",
      borderLight: "border-gray-800",
      bgLight: "bg-gray-800",
      cardBg: "bg-gray-800",
      shadow: "shadow-lg shadow-black/20",
      heroOverlay: "bg-gray-900/70"
    };
  }, [theme.isDayTime]);

  // Filter data berdasarkan department
  const filteredData = useMemo(() => {
    if (selectedDepartment === "all") return attendanceRecords;
    return attendanceRecords.filter(record => record.department === selectedDepartment);
  }, [attendanceRecords, selectedDepartment]);

  // Hitung statistik
  const stats = useMemo(() => {
    const total = filteredData.length;
    const onTime = filteredData.filter(r => r.status === 'on-time').length;
    const late = filteredData.filter(r => r.status === 'late').length;
    const absent = filteredData.filter(r => r.status === 'absent').length;
    const averageWorkHours = filteredData.length > 0 
      ? (filteredData.reduce((sum, r) => sum + (r.workHours || 0), 0) / filteredData.length).toFixed(1)
      : '0.0';

    return { total, onTime, late, absent, averageWorkHours };
  }, [filteredData]);

  // Fungsi untuk mendapatkan waktu sekarang dalam format HH:mm
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Handle check in button click
  const handleCheckInClick = () => {
    setFormData({
      eodReport: '',
      documentation: null,
      documentationType: 'none',
      isCheckIn: true,
      checkIn: getCurrentTime(),
      checkOut: undefined
    });
    setShowAttendanceForm(true);
  };

  // Handle check out button click
  const handleCheckOutClick = () => {
    setFormData(prev => ({
      ...prev,
      isCheckIn: false,
      checkOut: getCurrentTime(),
      checkIn: todayStatus.todayRecord?.checkIn || getCurrentTime()
    }));
    setShowAttendanceForm(true);
  };

  // Handle form input changes
  const handleFormChange = (field: keyof AttendanceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({
          ...prev,
          documentation: file,
          documentationType: 'upload'
        }));
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please upload an image file');
      }
    }
  };

  // Handle camera capture
  const handleCameraCapture = (imageData: string) => {
    // Convert data URL to Blob
    fetch(imageData)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `attendance_${new Date().getTime()}.jpg`, { type: 'image/jpeg' });
        setFormData(prev => ({
          ...prev,
          documentation: file,
          documentationType: 'camera'
        }));
        setPreviewImage(imageData);
        setShowCamera(false);
      });
  };

  // Handle details button click
  const handleViewDetails = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  // Handle form submission
  const handleSubmitAttendance = async () => {
    if (!currentUser) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Check if attendance is already complete for today
    if (todayStatus.hasCheckedIn && todayStatus.hasCheckedOut) {
      alert('Attendance already complete for today. You can check in/out again tomorrow.');
      return;
    }
    
    // Validasi
    if (formData.isCheckIn && !formData.checkIn) {
      alert('Please fill check in time');
      return;
    }

    if (!formData.isCheckIn && !formData.checkOut) {
      alert('Please fill check out time');
      return;
    }

    if (!formData.isCheckIn && !formData.eodReport.trim()) {
      alert('Please fill your End of Day report');
      return;
    }

    try {
      // Don't calculate work_hours on frontend - let backend handle it
      // The backend will calculate work_hours when both check_in and check_out exist

      // Tentukan status (late jika check in setelah 09:00)
      let status: 'on-time' | 'late' = 'on-time';
      let lateMinutes = undefined;
      if (formData.checkIn) {
        const [hour, minute] = formData.checkIn.split(':').map(Number);
        if (hour > 9 || (hour === 9 && minute > 0)) {
          status = 'late';
          lateMinutes = (hour - 9) * 60 + minute;
        }
      }

      // Prepare data for API
      const submitData: any = {
        date: today
      };

      // Only add check_in/check_out if they have values
      if (formData.checkIn) {
        submitData.check_in = formData.checkIn;
      }
      if (formData.checkOut) {
        submitData.check_out = formData.checkOut;
      }
      if (formData.eodReport) {
        submitData.eod_report = formData.eodReport;
      }
      if (status) {
        submitData.status = status;
      }
      if (lateMinutes !== undefined) {
        submitData.late_minutes = lateMinutes;
      }
      // Don't include work_hours - let backend calculate it

      console.log('Submitting to API:', submitData);

      // Prepare FormData if there's a file to upload
      let response;
      if (formData.documentation && typeof formData.documentation === 'object' && formData.documentation instanceof File) {
        // Use FormData for file upload
        const formDataWithFile = new FormData();
        Object.keys(submitData).forEach(key => {
          formDataWithFile.append(key, submitData[key]);
        });
        formDataWithFile.append('documentation', formData.documentation);
        formDataWithFile.append('documentation_type', formData.documentationType);
        console.log('Submitting FormData with file:', {
          date: submitData.date,
          check_in: submitData.check_in,
          check_out: submitData.check_out,
          eod_report: submitData.eod_report,
          documentationType: formData.documentationType,
          fileName: formData.documentation.name
        });
        response = await attendanceApi.createWithFile(formDataWithFile);
      } else {
        // Use regular JSON for no-file case
        console.log('Submitting JSON data (no file)');
        response = await attendanceApi.create(submitData);
      }
      console.log('API Response:', response);

      if (response.data) {
        // Transform the API response from snake_case to camelCase
        const apiRecord = response.data;
        console.log('Transforming API record:', apiRecord);
        const newRecord: AttendanceRecord = {
          id: apiRecord.id,
          date: apiRecord.date,
          checkIn: apiRecord.check_in || formData.checkIn,
          checkOut: apiRecord.check_out || formData.checkOut,
          status: apiRecord.status || status,
          lateMinutes: parseInt(apiRecord.late_minutes) || lateMinutes || 0,
          workHours: parseFloat(apiRecord.work_hours) || 0,
          notes: apiRecord.notes,
          eodReport: apiRecord.eod_report || formData.eodReport,
          hasDocumentation: apiRecord.has_documentation,
          documentationFile: apiRecord.documentation_file,
          employeeId: apiRecord.employee_id,
          employeeName: apiRecord.employee_name,
          department: apiRecord.department,
        };

        console.log('New record created:', newRecord);

        // Reload from API to ensure sync with fresh data
        try {
          console.log('Reloading attendance data from API...');
          const freshResponse = await attendanceApi.getAll();
          const freshData = freshResponse.data || [];
          console.log('Fresh API response count:', freshData.length);
          console.log('Fresh API response sample (first 3):', freshData.slice(0, 3).map((r: any) => ({
            id: r.id,
            date: r.date,
            check_in: r.check_in,
            check_out: r.check_out,
            employee_id: r.employee_id,
            employee_name: r.employee_name,
            user_id: r.user_id
          })));
          
          const transformedData = freshData.map((record: any) => ({
            id: record.id,
            date: record.date ? record.date.split('T')[0] : record.date, // Extract just the date part
            checkIn: record.check_in,
            checkOut: record.check_out,
            status: record.status,
            lateMinutes: parseInt(record.late_minutes) || 0,
            workHours: parseFloat(record.work_hours) || 0,
            notes: record.notes,
            eodReport: record.eod_report,
            hasDocumentation: record.has_documentation,
            documentationFile: record.documentation_file,
            employeeId: record.employee_id,
            employeeName: record.employee_name,
            department: record.department,
          }));
          
          console.log('Refreshed attendance data from API:', transformedData.length, 'records');
          console.log('Transformed data sample (first 3):', transformedData.slice(0, 3).map((r: AttendanceRecord) => ({
            id: r.id,
            date: r.date,
            checkIn: r.checkIn,
            checkOut: r.checkOut,
            employeeId: r.employeeId,
            employeeName: r.employeeName
          })));
          console.log('Today records:', transformedData.filter((r: AttendanceRecord) => r.date === today).map((r: AttendanceRecord) => ({ 
            id: r.id, 
            date: r.date, 
            employeeId: r.employeeId, 
            checkIn: r.checkIn, 
            checkOut: r.checkOut 
          })));
          
          setAttendanceRecords(transformedData);
        } catch (err) {
          console.error('Failed to refresh attendance data:', err);
        }
      }
      
      // Reset form
      setFormData({
        eodReport: '',
        documentation: null,
        documentationType: 'none',
        isCheckIn: false
      });
      setPreviewImage(null);
      setShowAttendanceForm(false);
      
      alert('Attendance submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting attendance:', error);
      alert('Failed to submit attendance: ' + (error.response?.data?.message || error.message));
    }
  };

  // Cek apakah user perlu mengisi attendance (hanya untuk employee dan PM)
  const shouldShowAttendanceButtons = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.role === 'employee' || currentUser.role === 'pm';
  }, [currentUser]);

  // Fungsi untuk reset data demo
  const resetDemoData = () => {
    if (currentUser && confirm('Reset semua data attendance? Ini akan menghapus semua record hari ini.')) {
      localStorage.removeItem(`attendance_${currentUser.id}`);
      window.location.reload();
    }
  };

  if (!currentUser) {
    return null; // Akan di-redirect oleh useEffect
  }

  return (
    <>
      {/* Attendance Form Modal */}
      {showAttendanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold ${themeColors.text}`}>
                  {formData.isCheckIn ? 'Check In Attendance' : 'Check Out Attendance'}
                </h3>
                <button
                  onClick={() => setShowAttendanceForm(false)}
                  className={`p-2 ${themeColors.textLight} hover:${themeColors.text}`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Time Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>
                      Check In Time
                    </label>
                    <div className="flex items-center gap-2">
                      <ClockIcon />
                      <input
                        type="text"
                        value={formData.checkIn || ''}
                        readOnly
                        className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg ${themeColors.bgLight} ${themeColors.text}`}
                      />
                    </div>
                  </div>
                  
                  {!formData.isCheckIn && (
                    <div>
                      <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>
                        Check Out Time
                      </label>
                      <div className="flex items-center gap-2">
                        <ClockIcon />
                        <input
                          type="text"
                          value={formData.checkOut || ''}
                          readOnly
                          className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg ${themeColors.bgLight} ${themeColors.text}`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* End of Day Report (hanya untuk check out) */}
                {!formData.isCheckIn && (
                  <div>
                    <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>
                      End of Day Report *
                    </label>
                    <textarea
                      value={formData.eodReport}
                      onChange={(e) => handleFormChange('eodReport', e.target.value)}
                      className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg ${themeColors.bgLight} ${themeColors.text}`}
                      rows={4}
                      placeholder="What did you work on today? (Required for check out)"
                      required
                    />
                    <p className={`text-xs ${themeColors.textLighter} mt-1`}>
                      Please describe your tasks and accomplishments for today
                    </p>
                  </div>
                )}

                {/* Documentation (hanya untuk check out) */}
                {!formData.isCheckIn && (
                  <div>
                    <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>
                      Documentation (Optional)
                    </label>
                    
                    <div className="flex gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className={`flex-1 py-3 border ${themeColors.border} rounded-lg flex flex-col items-center justify-center gap-2 hover:${themeColors.bgLight}`}
                      >
                        <CameraIcon />
                        <span className={`text-sm ${themeColors.text}`}>Take Photo</span>
                      </button>
                      
                      <label className="flex-1 py-3 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <UploadIcon />
                        <span className={`text-sm ${themeColors.text}`}>Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {previewImage && (
                      <div className="mt-4">
                        <p className={`text-sm ${themeColors.textLight} mb-2`}>Preview:</p>
                        <div className="relative w-full h-48 rounded-lg overflow-hidden">
                          <Image
                            src={previewImage}
                            alt="Documentation preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => {
                              setPreviewImage(null);
                              handleFormChange('documentation', null);
                              handleFormChange('documentationType', 'none');
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAttendanceForm(false)}
                    className={`flex-1 py-3 border ${themeColors.border} rounded-lg ${themeColors.text} hover:${themeColors.bgLight}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitAttendance}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {formData.isCheckIn ? 'Submit Check In' : 'Submit Check Out'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          theme={theme}
        />
      )}

      {/* Details/Documentation Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold ${themeColors.text}`}>
                  Attendance Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className={`p-2 ${themeColors.textLight} hover:${themeColors.text}`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-medium ${themeColors.textLight}`}>Date</label>
                    <p className={`text-lg font-semibold ${themeColors.text}`}>{selectedRecord.date}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${themeColors.textLight}`}>Employee</label>
                    <p className={`text-lg font-semibold ${themeColors.text}`}>{selectedRecord.employeeName}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${themeColors.textLight}`}>Check In</label>
                    <p className={`text-lg font-semibold ${themeColors.text}`}>{selectedRecord.checkIn || '-'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${themeColors.textLight}`}>Check Out</label>
                    <p className={`text-lg font-semibold ${themeColors.text}`}>{selectedRecord.checkOut || '-'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${themeColors.textLight}`}>Status</label>
                    <p className={`text-lg font-semibold ${
                      selectedRecord.status === 'on-time' ? 'text-green-600' :
                      selectedRecord.status === 'late' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {selectedRecord.status === 'on-time' ? 'On Time' :
                       selectedRecord.status === 'late' ? `Late (${selectedRecord.lateMinutes}m)` : 'Absent'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${themeColors.textLight}`}>Work Hours</label>
                    <p className={`text-lg font-semibold ${themeColors.text}`}>{(selectedRecord.workHours || 0).toFixed(1)} hours</p>
                  </div>
                </div>

                {/* EOD Report */}
                {selectedRecord.eodReport && (
                  <div>
                    <label className={`text-sm font-medium ${themeColors.textLight}`}>End of Day Report</label>
                    <div className={`mt-2 p-4 ${themeColors.bgLight} rounded-lg`}>
                      <p className={`${themeColors.text}`}>{selectedRecord.eodReport}</p>
                    </div>
                  </div>
                )}

                {/* Documentation Image */}
                {selectedRecord.hasDocumentation && selectedRecord.documentationFile && (
                  <div>
                    <label className={`text-sm font-medium ${themeColors.textLight}`}>Documentation</label>
                    <div className="mt-2">
                      {(() => {
                        // Construct full URL pointing to Laravel's storage
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://thermostable-phlebotomic-miss.ngrok-free.dev/api';
                        const baseUrl = apiUrl.replace('/api', ''); // Remove /api to get base URL
                        const imageUrl = `${baseUrl}/storage/${selectedRecord.documentationFile}`;
                        console.log('Loading image from:', imageUrl);
                        console.log('DocumentationFile value:', selectedRecord.documentationFile);
                        return (
                          <>
                            <img
                              src={imageUrl}
                              alt="Documentation"
                              className="w-full h-auto max-h-96 object-contain rounded-lg"
                              onLoad={() => {
                                console.log('Image loaded successfully:', imageUrl);
                              }}
                              onError={(e) => {
                                console.error('Failed to load image from URL:', imageUrl);
                                console.error('Image element src:', e.currentTarget.src);
                                console.error('Documentation file path:', selectedRecord.documentationFile);
                                
                                // Show fallback message
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="p-4 bg-red-50 rounded-lg text-center">
                                      <p class="text-red-600 text-sm">Failed to load image</p>
                                      <p class="text-red-500 text-xs mt-1">Path: ${selectedRecord.documentationFile}</p>
                                      <p class="text-gray-500 text-xs mt-2">Attempted URL: ${imageUrl}</p>
                                      <p class="text-gray-500 text-xs mt-2">Check that Laravel server is running and storage:link is configured</p>
                                    </div>
                                  `;
                                }
                              }}
                            />
                            <p className="text-xs text-gray-500 mt-2">File: {selectedRecord.documentationFile}</p>
                          </>
                        );
                      })()}
                      <a
                        href={(() => {
                          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://thermostable-phlebotomic-miss.ngrok-free.dev/api';
                          const baseUrl = apiUrl.replace('/api', '');
                          return `${baseUrl}/storage/${selectedRecord.documentationFile}`;
                        })()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                      >
                        View Full Size →
                      </a>
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <div className="flex gap-3 pt-4 border-t ${themeColors.border}">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative h-64 md:h-80 flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: `url("${theme.backgroundImage}")`,
        }}
      >
        <div className={`absolute inset-0 ${theme.isDayTime ? 'bg-white/70' : 'bg-gray-900/70'}`} />
        
        <div className="relative z-10 text-center px-4 w-full">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${theme.isDayTime ? 'text-gray-900' : 'text-white'}`}>
            {currentUser.role === 'employee' ? 'My ' : ''}Attendance <span className="text-blue-600">Management</span>
          </h1>
          <p className={`text-lg md:text-xl ${theme.isDayTime ? 'text-gray-700' : 'text-gray-300'} max-w-3xl mx-auto`}>
            {currentUser.role === 'supervisor' 
              ? 'Real-time tracking and monitoring of all employee attendance records'
              : currentUser.role === 'pm'
              ? `Track ${currentUser.department} department attendance records`
              : 'Track your personal attendance history and records'}
          </p>
        </div>
      </div>

      <div className={`min-h-screen ${themeColors.bg}`}>
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
                        <span className={`${themeColors.text} font-medium`}>Attendance</span>
                      </div>
                    </li>
                  </ol>
                </nav>
                
                <h2 className={`text-2xl font-bold ${themeColors.text}`}>
                  {currentUser.role === 'supervisor' 
                    ? 'Company Attendance Dashboard'
                    : currentUser.role === 'pm'
                    ? `${currentUser.department} Department Attendance`
                    : 'My Attendance History'}
                </h2>
                <p className={`${themeColors.textLight} mt-1`}>
                  {currentUser.role === 'supervisor' 
                    ? 'Monitor attendance across all departments'
                    : currentUser.role === 'pm'
                    ? 'Track team member attendance and punctuality'
                    : 'View your complete attendance record'}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {/* Attendance Buttons (hanya untuk employee dan PM) */}
                {shouldShowAttendanceButtons && (
                  <div className="flex gap-3">
                    {/* Check In Button (hijau) - hanya muncul jika belum check in */}
                    {!todayStatus.hasCheckedIn && (
                      <button
                        onClick={handleCheckInClick}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Check In Now
                      </button>
                    )}
                    
                    {/* Check Out Button (biru) - hanya muncul jika sudah check in tapi belum check out */}
                    {todayStatus.hasCheckedIn && !todayStatus.hasCheckedOut && (
                      <button
                        onClick={handleCheckOutClick}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Check Out Now
                      </button>
                    )}
                  </div>
                )}
                
                <Link 
                  href="/"
                  className={`px-4 py-2 ${themeColors.cardBg} ${themeColors.text} border ${themeColors.border} rounded-lg hover:${themeColors.bgLight} flex items-center gap-2`}
                >
                  ← Back to Dashboard
                </Link>
                
                {/* Reset Button untuk testing */}
                <button 
                  onClick={resetDemoData}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Data
                </button>
                
                {currentUser.role !== 'employee' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Report
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Today's Status Card (hanya untuk employee dan PM) */}
          {(currentUser.role === 'employee' || currentUser.role === 'pm') && (
            <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6 mb-8`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className={`text-lg font-semibold ${themeColors.text} mb-2`}>Today's Status</h3>
                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-lg ${todayStatus.hasCheckedIn ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                      <span className="font-medium">Check In:</span> {todayStatus.todayRecord?.checkIn || 'Not yet'}
                    </div>
                    <div className={`px-4 py-2 rounded-lg ${todayStatus.hasCheckedOut ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                      <span className="font-medium">Check Out:</span> {todayStatus.todayRecord?.checkOut || 'Not yet'}
                    </div>
                  </div>
                </div>
                
                {shouldShowAttendanceButtons && (
                  <div className="flex gap-3">
                    {/* Check In Button (hijau) */}
                    {!todayStatus.hasCheckedIn && (
                      <button
                        onClick={handleCheckInClick}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Check In Now
                      </button>
                    )}
                    
                    {/* Check Out Button (biru) */}
                    {todayStatus.hasCheckedIn && !todayStatus.hasCheckedOut && (
                      <button
                        onClick={handleCheckOutClick}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Check Out Now
                      </button>
                    )}
                    
                    {/* Status jika sudah check in dan check out */}
                    {todayStatus.hasCheckedIn && todayStatus.hasCheckedOut && (
                      <div className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg flex items-center gap-2 font-medium">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Attendance Complete for Today
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {todayStatus.hasCheckedIn && !todayStatus.hasCheckedOut && (
                <div className={`mt-4 p-4 ${theme.isDayTime ? 'bg-blue-50' : 'bg-blue-900/20'} rounded-lg`}>
                  <p className={`text-sm ${themeColors.text}`}>
                    <span className="font-medium">Reminder:</span> Don't forget to fill your End of Day report when checking out.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} p-6 hover-lift group overflow-hidden relative`}>
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className={`text-sm ${themeColors.textLight}`}>Total {currentUser.role === 'employee' ? 'Days' : 'Employees'}</p>
                  <p className={`text-3xl font-bold ${themeColors.text} mt-2`}>{stats.total}</p>
                </div>
                <div className={`p-3 ${theme.isDayTime ? 'bg-blue-50' : 'bg-blue-900/20'} rounded-lg`}>
                  <UserGroupIcon />
                </div>
              </div>
              <div className={`mt-4 pt-4 border-t ${themeColors.borderLight}`}>
                <p className={`text-xs ${themeColors.textLighter}`}>
                  {currentUser.role === 'employee' 
                    ? 'Total working days tracked'
                    : `${currentUser.role === 'pm' ? 'Team members' : 'Employees'} today`}
                </p>
              </div>
            </div>
            
            <div className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} p-6 hover-lift group overflow-hidden relative`}>
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className={`text-sm ${themeColors.textLight}`}>On Time</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.onTime}</p>
                </div>
                <div className={`p-3 ${theme.isDayTime ? 'bg-green-50' : 'bg-green-900/20'} rounded-lg`}>
                  <CheckCircleIcon />
                </div>
              </div>
              <div className={`mt-4 pt-4 border-t ${themeColors.borderLight}`}>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.onTime / stats.total) * 100}%` }}
                  />
                </div>
                <p className={`text-xs ${themeColors.textLighter} mt-1`}>
                  {stats.total > 0 ? `${((stats.onTime / stats.total) * 100).toFixed(1)}% on-time rate` : 'No data'}
                </p>
              </div>
            </div>
            
            <div className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} p-6 hover-lift group overflow-hidden relative`}>
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className={`text-sm ${themeColors.textLight}`}>Late Arrivals</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{stats.late}</p>
                </div>
                <div className={`p-3 ${theme.isDayTime ? 'bg-amber-50' : 'bg-amber-900/20'} rounded-lg`}>
                  <ClockIcon />
                </div>
              </div>
              <div className={`mt-4 pt-4 border-t ${themeColors.borderLight}`}>
                <p className={`text-xs ${themeColors.textLighter}`}>
                  Average: {stats.late > 0 ? '15 mins' : '0 mins'} late
                </p>
              </div>
            </div>
            
            <div className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} p-6 hover-lift group overflow-hidden relative`}>
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className={`text-sm ${themeColors.textLight}`}>Avg. Work Hours</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.averageWorkHours}h</p>
                </div>
                <div className={`p-3 ${theme.isDayTime ? 'bg-purple-50' : 'bg-purple-900/20'} rounded-lg`}>
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className={`mt-4 pt-4 border-t ${themeColors.borderLight}`}>
                <p className={`text-xs ${themeColors.textLighter}`}>
                  {currentUser.role === 'employee' ? 'Your average' : 'Department average'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Filters dan Controls */}
          <div className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} p-6 mb-8 hover-lift group overflow-hidden relative`}>
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="flex flex-col md:flexRow justify-between items-start md:items-center gap-4">
              <div>
                <h3 className={`text-lg font-semibold ${themeColors.text}`}>Attendance Records</h3>
                <p className={`text-sm ${themeColors.textLight} mt-1`}>Filter and manage attendance data</p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <CalendarIcon />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={`px-3 py-2 border ${themeColors.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${themeColors.bgLight} ${themeColors.text}`}
                  />
                </div>
                
                {/* Department Filter (hanya untuk supervisor) */}
                {currentUser.role === 'supervisor' && (
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className={`px-3 py-2 border ${themeColors.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${themeColors.bgLight} ${themeColors.text}`}
                  >
                    <option value="all">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                )}
                
                {/* Time Range */}
                <div className={`flex ${theme.isDayTime ? 'bg-gray-100' : 'bg-gray-800'} p-1 rounded-lg`}>
                  {(['today', 'week', 'month'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        timeRange === range 
                          ? `${theme.isDayTime ? 'bg-white text-blue-600' : 'bg-gray-700 text-white'} shadow-sm` 
                          : `${themeColors.textLight} hover:${themeColors.text}`
                      }`}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Attendance Table */}
          <div className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} overflow-hidden mb-8 hover-lift group relative`}>
            <div className={`px-6 py-4 border-b ${themeColors.border} ${themeColors.bgLight}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-semibold ${themeColors.text}`}>Detailed Records</h3>
                  <p className={`text-sm ${themeColors.textLight}`}>
                    {currentUser.role === 'employee' 
                      ? 'Your complete attendance history'
                      : `Showing ${filteredData.length} ${currentUser.role === 'pm' ? 'team members' : 'employees'}`}
                  </p>
                </div>
                <div className={`text-sm ${themeColors.textLighter}`}>
                  Last updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={themeColors.bgLight}>
                  <tr>
                    {currentUser.role !== 'employee' && <th className={`px-6 py-3 text-left text-xs font-medium ${themeColors.textLight} uppercase tracking-wider`}>ID</th>}
                    <th className={`px-6 py-3 text-left text-xs font-medium ${themeColors.textLight} uppercase tracking-wider`}>
                      {currentUser.role === 'employee' ? 'Date' : 'Employee'}
                    </th>
                    {currentUser.role !== 'employee' && <th className={`px-6 py-3 text-left text-xs font-medium ${themeColors.textLight} uppercase tracking-wider`}>Department</th>}
                    <th className={`px-6 py-3 text-left text-xs font-medium ${themeColors.textLight} uppercase tracking-wider`}>Check In</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${themeColors.textLight} uppercase tracking-wider`}>Check Out</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${themeColors.textLight} uppercase tracking-wider`}>Status</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${themeColors.textLight} uppercase tracking-wider`}>Work Hours</th>
                    {currentUser.role !== 'employee' && <th className={`px-6 py-3 text-left text-xs font-medium ${themeColors.textLight} uppercase tracking-wider`}>EOD Report</th>}
                    {currentUser.role !== 'employee' && <th className={`px-6 py-3 text-left text-xs font-medium ${themeColors.textLight} uppercase tracking-wider`}>Documentation</th>}
                    <th className={`px-6 py-3 text-left text-xs font-medium ${themeColors.textLight} uppercase tracking-wider`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((record) => (
                    <tr key={record.id} className={`hover:${themeColors.bgLight}`}>
                      {currentUser.role !== 'employee' && (
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeColors.text}`}>{record.employeeId}</td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${themeColors.text}`}>
                            {currentUser.role === 'employee' 
                              ? new Date(record.date).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })
                              : record.employeeName}
                          </div>
                          {currentUser.role === 'employee' && (
                            <div className={`text-sm ${themeColors.textLight}`}>{record.date}</div>
                          )}
                        </div>
                      </td>
                      {currentUser.role !== 'employee' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs ${theme.isDayTime ? 'bg-blue-100 text-blue-800' : 'bg-blue-900/30 text-blue-300'} rounded-full`}>
                            {record.department}
                          </span>
                        </td>
                      )}
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeColors.text}`}>
                        <div className="flex items-center gap-2">
                          <ClockIcon />
                          {record.checkIn}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeColors.text}`}>
                        <div className="flex items-center gap-2">
                          <ClockIcon />
                          {record.checkOut}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                          record.status === 'on-time' 
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'late'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status === 'on-time' ? 'On Time' : 
                           record.status === 'late' ? `Late (${record.lateMinutes}m)` : 
                           'Absent'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeColors.text}`}>
                        {(record.workHours || 0).toFixed(1)} hours
                      </td>
                      {currentUser.role !== 'employee' && (
                        <>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeColors.textLight} max-w-xs truncate`}>
                            {record.eodReport || '-'}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeColors.textLight}`}>
                            {record.hasDocumentation ? (
                              <span className="text-green-600">✓ Available</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleViewDetails(record)}
                          className="text-blue-600 hover:text-blue-900 mr-3">
                          Details
                        </button>
                        {currentUser.role !== 'employee' && record.status === 'late' && (
                          <button className="text-amber-600 hover:text-amber-900">
                            Send Reminder
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className={`px-6 py-4 border-t ${themeColors.border} ${themeColors.bgLight}`}>
              <div className="flex items-center justify-between">
                <div className={`text-sm ${themeColors.textLight}`}>
                  Showing {Math.min(filteredData.length, 10)} of {filteredData.length} records
                </div>
                <div className="flex gap-2">
                  <button className={`px-3 py-1 border ${themeColors.border} rounded text-sm hover:${themeColors.bgLight}`}>
                    ← Previous
                  </button>
                  <button className={`px-3 py-1 border ${themeColors.border} rounded text-sm hover:${themeColors.bgLight}`}>
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chart Section */}
          {currentUser.role !== 'employee' && (
            <div className={`${themeColors.cardBg} rounded-xl ${themeColors.shadow} border ${themeColors.border} p-6 mb-8`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-lg font-semibold ${themeColors.text}`}>Attendance Trends</h3>
                  <p className={`text-sm ${themeColors.textLight}`}>Weekly attendance overview</p>
                </div>
                <select className={`px-3 py-2 border ${themeColors.border} rounded-lg text-sm ${themeColors.bgLight} ${themeColors.text}`}>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Month</option>
                </select>
              </div>
              
              <div className="h-64 flex items-end gap-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const onTime = Math.floor(Math.random() * 20) + 80;
                  const late = Math.floor(Math.random() * 10) + 5;
                  const absent = Math.floor(Math.random() * 5);
                  
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center">
                      <div className={`text-xs ${themeColors.textLight} mb-2`}>{day}</div>
                      <div className="w-full flex flex-col-reverse h-48 gap-1">
                        <div 
                          className="bg-green-500 rounded-t"
                          style={{ height: `${onTime}%` }}
                          title={`On Time: ${onTime}%`}
                        />
                        <div 
                          className="bg-amber-500 rounded-t"
                          style={{ height: `${late}%` }}
                          title={`Late: ${late}%`}
                        />
                        <div 
                          className="bg-red-500 rounded-t"
                          style={{ height: `${absent}%` }}
                          title={`Absent: ${absent}%`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className={`text-sm ${themeColors.textLight}`}>On Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded"></div>
                  <span className={`text-sm ${themeColors.textLight}`}>Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className={`text-sm ${themeColors.textLight}`}>Absent</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Employee-specific content */}
          {currentUser.role === 'employee' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Summary */}
              <div className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} p-6 hover-lift group overflow-hidden relative`}>
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 opacity-10 group-hover:opacity-20 transition-opacity" />
                <h3 className={`text-lg font-semibold ${themeColors.text} mb-6 relative z-10`}>📊 Monthly Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`${themeColors.textLight}`}>Total Working Days</span>
                    <span className="font-semibold">22</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${themeColors.textLight}`}>On Time Days</span>
                    <span className="font-semibold text-green-600">20</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${themeColors.textLight}`}>Late Days</span>
                    <span className="font-semibold text-amber-600">2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${themeColors.textLight}`}>Absent Days</span>
                    <span className="font-semibold text-red-600">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${themeColors.textLight}`}>Total Work Hours</span>
                    <span className="font-semibold">176.5h</span>
                  </div>
                </div>
              </div>
              
              {/* Request Time Off */}
              <div className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} p-6 hover-lift group overflow-hidden relative`}>
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 opacity-10 group-hover:opacity-20 transition-opacity" />
                <h3 className={`text-lg font-semibold ${themeColors.text} mb-6 relative z-10`}>🕐 Request Time Off</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>Leave Type</label>
                    <select className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg ${themeColors.bgLight} ${themeColors.text}`}>
                      <option>Sick Leave</option>
                      <option>Annual Leave</option>
                      <option>Personal Leave</option>
                      <option>Emergency Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>Dates</label>
                    <div className="flex gap-2">
                      <input type="date" className={`flex-1 px-3 py-2 border ${themeColors.border} rounded-lg ${themeColors.bgLight} ${themeColors.text}`} />
                      <span className="self-center">to</span>
                      <input type="date" className={`flex-1 px-3 py-2 border ${themeColors.border} rounded-lg ${themeColors.bgLight} ${themeColors.text}`} />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeColors.textLight} mb-2`}>Reason</label>
                    <textarea 
                      className={`w-full px-3 py-2 border ${themeColors.border} rounded-lg ${themeColors.bgLight} ${themeColors.text}`}
                      rows={3}
                      placeholder="Brief reason for your leave request..."
                    />
                  </div>
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Actions untuk Supervisor/PM */}
          {currentUser.role !== 'employee' && (
            <div className={`${themeColors.cardBg} rounded-2xl ${themeColors.shadow} border ${themeColors.border} p-6 hover-lift group overflow-hidden relative`}>
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 opacity-10 group-hover:opacity-20 transition-opacity" />
              <h3 className={`text-lg font-semibold ${themeColors.text} mb-6 relative z-10`}>⚡ Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className={`p-4 border ${themeColors.border} rounded-lg hover:${themeColors.bgLight} text-left`}>
                  <div className={`font-medium ${themeColors.text}`}>Send Attendance Report</div>
                  <div className={`text-sm ${themeColors.textLight} mt-1`}>Generate and send weekly report</div>
                </button>
                <button className={`p-4 border ${themeColors.border} rounded-lg hover:${themeColors.bgLight} text-left`}>
                  <div className={`font-medium ${themeColors.text}`}>Add Attendance Exception</div>
                  <div className={`text-sm ${themeColors.textLight} mt-1`}>Add manual attendance record</div>
                </button>
                <button className={`p-4 border ${themeColors.border} rounded-lg hover:${themeColors.bgLight} text-left`}>
                  <div className={`font-medium ${themeColors.text}`}>Set Reminders</div>
                  <div className={`text-sm ${themeColors.textLight} mt-1`}>Configure attendance reminders</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
