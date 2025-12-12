'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { FiCalendar, FiClock, FiUsers, FiCheckCircle, FiAlertCircle, FiXCircle } from 'react-icons/fi';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    upcomingAppointments: []
  });
  const [loading, setLoading] = useState(true);

  const APPOINTMENT_API = process.env.APPOINTMENT_API_URL || 'http://localhost:4002';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${APPOINTMENT_API}/api/appointments/doctor`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        const appointments = data.appointments || [];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const pending = appointments.filter(a => a.status === 'pending').length;
        const completed = appointments.filter(a => a.status === 'completed').length;
        const todayAppts = appointments.filter(a => {
          const apptDate = new Date(a.appointmentDate);
          return apptDate >= today && apptDate < tomorrow;
        }).length;
        
        const upcoming = appointments
          .filter(a => ['pending', 'approved'].includes(a.status))
          .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
          .slice(0, 5);
        
        setStats({
          totalAppointments: appointments.length,
          pendingAppointments: pending,
          todayAppointments: todayAppts,
          completedAppointments: completed,
          upcomingAppointments: upcoming
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
            <h1 className="text-2xl font-bold">Welcome back, Dr. {user?.name}!</h1>
            <p className="mt-1 text-green-100">
              Manage your appointments and patient consultations from your dashboard.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiCalendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '-' : stats.totalAppointments}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FiClock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '-' : stats.pendingAppointments}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiUsers className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '-' : stats.todayAppointments}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '-' : stats.completedAppointments}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Requests Alert */}
          {stats.pendingAppointments > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center">
              <FiAlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-yellow-800">
                  You have <strong>{stats.pendingAppointments}</strong> pending appointment request(s) waiting for your approval.
                </p>
              </div>
              <Link href="/doctor/appointments?filter=pending" className="ml-auto btn-primary text-sm">
                Review Now
              </Link>
            </div>
          )}

          {/* Upcoming Appointments */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              <Link href="/doctor/appointments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : stats.upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {stats.upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold">
                          {appointment.patientName?.charAt(0) || 'P'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">
                          {appointment.patientName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.reason}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatDate(appointment.appointmentDate)}
                      </p>
                      <p className="text-sm text-gray-500">{appointment.timeSlot}</p>
                    </div>
                    <span className={`badge ${getStatusBadge(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming appointments</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
