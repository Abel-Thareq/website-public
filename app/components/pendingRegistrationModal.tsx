'use client';

import { useState, useEffect } from 'react';
import { pendingRegistrationApi } from '../../lib/api';

interface PendingRegistration {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  department?: string;
  position?: string;
  phone?: string;
  status: string;
  created_at: string;
}

interface PendingRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  theme: any;
}

export default function PendingRegistrationModal({ isOpen, onClose, onRefresh, theme }: PendingRegistrationModalProps) {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const isDarkMode = !theme.isDayTime;

  useEffect(() => {
    if (isOpen) {
      fetchPendingRegistrations();
    }
  }, [isOpen]);

  const fetchPendingRegistrations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await pendingRegistrationApi.getPendingRegistrations();
      // Handle both array response and object with data property
      setRegistrations(Array.isArray(response) ? response : response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pending registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (window.confirm('Are you sure you want to approve this registration?')) {
      try {
        setSuccess('');
        setError('');
        await pendingRegistrationApi.approvePendingRegistration(id);
        setSuccess('Registration approved successfully!');
        setSelectedId(null);
        setTimeout(() => {
          fetchPendingRegistrations();
          onRefresh();
        }, 1500);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to approve registration');
      }
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    if (window.confirm('Are you sure you want to reject this registration?')) {
      try {
        setError('');
        setSuccess('');
        setRejectingId(id);
        await pendingRegistrationApi.rejectPendingRegistration(id, rejectReason);
        setSuccess('Registration rejected successfully!');
        setRejectingId(null);
        setRejectReason('');
        setSelectedId(null);
        setTimeout(() => {
          fetchPendingRegistrations();
          onRefresh();
        }, 1500);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to reject registration');
        setRejectingId(null);
      }
    }
  };

  if (!isOpen) return null;

  const selectedRegistration = registrations.find(r => r.id === selectedId);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm cursor-pointer" onClick={onClose}>
      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20`} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b p-6 flex justify-between items-center`}>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Pending Registrations
            </h2>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {registrations.length} pending account{registrations.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`text-2xl font-bold cursor-pointer transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500 text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500 text-green-600">
              {success}
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Registrations List */}
            <div className="lg:col-span-1">
              <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Accounts to Review
              </h3>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`h-20 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} animate-pulse`}
                    />
                  ))}
                </div>
              ) : registrations.length === 0 ? (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="text-4xl mb-2">✓</div>
                  <p>No pending registrations!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {registrations.map(reg => (
                    <button
                      key={reg.id}
                      onClick={() => setSelectedId(reg.id)}
                      className={`w-full text-left p-4 rounded-lg transition-all border-2 ${
                        selectedId === reg.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : isDarkMode
                          ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                          reg.role === 'pm' ? 'bg-purple-600' : 'bg-blue-600'
                        }`}>
                          {reg.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {reg.name}
                          </p>
                          <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {reg.email}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              reg.role === 'pm'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {reg.role.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details & Actions */}
            <div className="lg:col-span-2">
              {selectedRegistration ? (
                <div>
                  <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Registration Details
                  </h3>

                  <div className={`rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} p-6 mb-6`}>
                    {/* User Info */}
                    <div className="mb-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl text-white ${
                          selectedRegistration.role === 'pm' ? 'bg-purple-600' : 'bg-blue-600'
                        }`}>
                          {selectedRegistration.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedRegistration.name}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            @{selectedRegistration.username}
                          </p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="space-y-4">
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Email
                          </p>
                          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {selectedRegistration.email}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Role
                            </p>
                            <p className={`font-semibold capitalize ${selectedRegistration.role === 'pm' ? 'text-purple-400' : 'text-blue-400'}`}>
                              {selectedRegistration.role}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Department
                            </p>
                            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-900'}>
                              {selectedRegistration.department || '-'}
                            </p>
                          </div>
                        </div>

                        {selectedRegistration.position && (
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Position
                            </p>
                            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-900'}>
                              {selectedRegistration.position}
                            </p>
                          </div>
                        )}

                        {selectedRegistration.phone && (
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Phone
                            </p>
                            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-900'}>
                              {selectedRegistration.phone}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Submitted
                          </p>
                          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-900'}>
                            {new Date(selectedRegistration.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => handleApprove(selectedRegistration.id)}
                        className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold transition-all flex items-center justify-center gap-2"
                      >
                        ✓ Approve Account
                      </button>

                      <div>
                        <label className={`block text-xs font-bold mb-2 uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Reject Reason (Optional)
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className={`w-full px-4 py-2 rounded-lg border transition-all text-sm ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
                          } focus:ring-2 focus:ring-red-500/20`}
                          placeholder="Explain why this registration is being rejected..."
                          rows={3}
                        />
                      </div>

                      <button
                        onClick={() => handleReject(selectedRegistration.id)}
                        disabled={rejectingId === selectedRegistration.id}
                        className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {rejectingId === selectedRegistration.id ? 'Rejecting...' : '✕ Reject Account'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`flex items-center justify-center h-64 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Select a registration to review
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
