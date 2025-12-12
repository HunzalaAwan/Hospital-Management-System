'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiUser, FiX, FiFilter } from 'react-icons/fi';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelModal, setCancelModal] = useState(null);

  const APPOINTMENT_API = process.env.APPOINTMENT_API_URL || 'http://localhost:4002';

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      
      const res = await fetch(`${APPOINTMENT_API}/api/appointments/patient${params}`, {
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

  const handleCancel = async (appointmentId) => {
    try {
      const res = await fetch(`${APPOINTMENT_API}/api/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (res.ok) {
        toast.success('Appointment cancelled successfully');
        fetchAppointments();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('An error occurred');
    } finally {
      setCancelModal(null);
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

  const canCancel = (status) => ['pending', 'approved'].includes(status);

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-500 mt-1">View and manage your appointments</p>
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
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiUser className="w-7 h-7 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Dr. {appointment.doctorName}
                        </h3>
                        <p className="text-sm text-primary-600">{appointment.specialization}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <FiCalendar className="mr-1" />
                            {formatDate(appointment.appointmentDate)}
                          </span>
                          <span className="flex items-center">
                            <FiClock className="mr-1" />
                            {appointment.timeSlot}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Reason:</strong> {appointment.reason}
                        </p>
                        {appointment.rejectionReason && (
                          <p className="text-sm text-red-600 mt-1">
                            <strong>Rejection Reason:</strong> {appointment.rejectionReason}
                          </p>
                        )}
                        {appointment.prescription && (
                          <div className="mt-2 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-800">Prescription:</p>
                            <p className="text-sm text-green-700">{appointment.prescription}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`badge ${getStatusBadge(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      {canCancel(appointment.status) && (
                        <button
                          onClick={() => setCancelModal(appointment)}
                          className="btn-danger flex items-center"
                        >
                          <FiX className="mr-1" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
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
                  : 'Book your first appointment with our doctors'}
              </p>
            </div>
          )}

          {/* Cancel Confirmation Modal */}
          {cancelModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cancel Appointment?
                </h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to cancel your appointment with Dr. {cancelModal.doctorName} on {formatDate(cancelModal.appointmentDate)} at {cancelModal.timeSlot}?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setCancelModal(null)}
                    className="btn-secondary"
                  >
                    Keep Appointment
                  </button>
                  <button
                    onClick={() => handleCancel(cancelModal._id)}
                    className="btn-danger"
                  >
                    Yes, Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
