'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiUser, FiCheck, FiX, FiFilter, FiFileText } from 'react-icons/fi';

export default function DoctorAppointments() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialFilter);
  const [actionModal, setActionModal] = useState(null);
  const [modalData, setModalData] = useState({ reason: '', prescription: '', notes: '' });
  const [processing, setProcessing] = useState(false);

  const APPOINTMENT_API = process.env.APPOINTMENT_API_URL || 'http://localhost:4002';

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      
      const res = await fetch(`${APPOINTMENT_API}/api/appointments/doctor${params}`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`${APPOINTMENT_API}/api/appointments/${actionModal.appointment._id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notes: modalData.notes })
      });

      if (res.ok) {
        toast.success('Appointment approved successfully');
        fetchAppointments();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to approve appointment');
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('An error occurred');
    } finally {
      setProcessing(false);
      setActionModal(null);
      setModalData({ reason: '', prescription: '', notes: '' });
    }
  };

  const handleReject = async () => {
    if (!modalData.reason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setProcessing(true);
    try {
      const res = await fetch(`${APPOINTMENT_API}/api/appointments/${actionModal.appointment._id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: modalData.reason })
      });

      if (res.ok) {
        toast.success('Appointment rejected');
        fetchAppointments();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to reject appointment');
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('An error occurred');
    } finally {
      setProcessing(false);
      setActionModal(null);
      setModalData({ reason: '', prescription: '', notes: '' });
    }
  };

  const handleComplete = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`${APPOINTMENT_API}/api/appointments/${actionModal.appointment._id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          prescription: modalData.prescription,
          notes: modalData.notes 
        })
      });

      if (res.ok) {
        toast.success('Appointment completed');
        fetchAppointments();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to complete appointment');
      }
    } catch (error) {
      console.error('Complete error:', error);
      toast.error('An error occurred');
    } finally {
      setProcessing(false);
      setActionModal(null);
      setModalData({ reason: '', prescription: '', notes: '' });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
      completed: 'badge-completed',
      cancelled: 'badge-cancelled'
    };
    return badges[status] || 'badge-pending';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
              <p className="text-gray-500 mt-1">Manage patient appointments</p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field w-40"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Appointments List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment._id} className="card">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiUser className="w-7 h-7 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {appointment.patientName}
                        </h3>
                        <p className="text-sm text-gray-500">{appointment.patientEmail}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <FiCalendar className="mr-1" />
                            {formatDate(appointment.appointmentDate)}
                          </span>
                          <span className="flex items-center">
                            <FiClock className="mr-1" />
                            {appointment.timeSlot}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm"><strong>Reason:</strong> {appointment.reason}</p>
                          {appointment.symptoms && (
                            <p className="text-sm text-gray-600"><strong>Symptoms:</strong> {appointment.symptoms}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`badge ${getStatusBadge(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      
                      {/* Action Buttons based on status */}
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setActionModal({ type: 'approve', appointment })}
                            className="btn-success flex items-center"
                          >
                            <FiCheck className="mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => setActionModal({ type: 'reject', appointment })}
                            className="btn-danger flex items-center"
                          >
                            <FiX className="mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                      
                      {appointment.status === 'approved' && (
                        <button
                          onClick={() => setActionModal({ type: 'complete', appointment })}
                          className="btn-primary flex items-center"
                        >
                          <FiFileText className="mr-1" />
                          Complete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  {appointment.prescription && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Prescription:</p>
                        <p className="text-sm text-green-700">{appointment.prescription}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
              <p className="text-gray-500 mt-1">
                {filter !== 'all'
                  ? 'Try changing the filter to see more appointments'
                  : 'No appointments scheduled yet'}
              </p>
            </div>
          )}

          {/* Action Modals */}
          {actionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                {actionModal.type === 'approve' && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Approve Appointment
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Approve appointment for {actionModal.appointment.patientName} on {formatDate(actionModal.appointment.appointmentDate)} at {actionModal.appointment.timeSlot}?
                    </p>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={modalData.notes}
                        onChange={(e) => setModalData({ ...modalData, notes: e.target.value })}
                        className="input-field"
                        rows="2"
                        placeholder="Any notes for the patient..."
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setActionModal(null)} className="btn-secondary">
                        Cancel
                      </button>
                      <button onClick={handleApprove} disabled={processing} className="btn-success">
                        {processing ? 'Processing...' : 'Approve'}
                      </button>
                    </div>
                  </>
                )}

                {actionModal.type === 'reject' && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Reject Appointment
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Please provide a reason for rejecting this appointment.
                    </p>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Rejection *
                      </label>
                      <textarea
                        value={modalData.reason}
                        onChange={(e) => setModalData({ ...modalData, reason: e.target.value })}
                        className="input-field"
                        rows="3"
                        placeholder="e.g., Schedule conflict, Not accepting new patients..."
                        required
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setActionModal(null)} className="btn-secondary">
                        Cancel
                      </button>
                      <button onClick={handleReject} disabled={processing} className="btn-danger">
                        {processing ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </>
                )}

                {actionModal.type === 'complete' && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Complete Appointment
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Add prescription and notes for {actionModal.appointment.patientName}.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prescription
                        </label>
                        <textarea
                          value={modalData.prescription}
                          onChange={(e) => setModalData({ ...modalData, prescription: e.target.value })}
                          className="input-field"
                          rows="4"
                          placeholder="Enter prescription details..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={modalData.notes}
                          onChange={(e) => setModalData({ ...modalData, notes: e.target.value })}
                          className="input-field"
                          rows="2"
                          placeholder="Additional notes..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end mt-4">
                      <button onClick={() => setActionModal(null)} className="btn-secondary">
                        Cancel
                      </button>
                      <button onClick={handleComplete} disabled={processing} className="btn-primary">
                        {processing ? 'Processing...' : 'Complete'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
