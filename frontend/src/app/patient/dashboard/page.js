'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { FiCalendar, FiClock, FiUsers, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
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
      const res = await fetch(`${APPOINTMENT_API}/api/appointments/patient`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        const appointments = data.appointments || [];
        
        const pending = appointments.filter(a => a.status === 'pending').length;
        const completed = appointments.filter(a => a.status === 'completed').length;
        const upcoming = appointments
          .filter(a => ['pending', 'approved'].includes(a.status))
          .slice(0, 5);
        
        setStats({
          totalAppointments: appointments.length,
          pendingAppointments: pending,
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
    <ProtectedRoute allowedRoles={['patient']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
            <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="mt-1 text-primary-100">
              Manage your appointments and health journey from your dashboard.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiCalendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Appointments</p>
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

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/patient/doctors" className="card hover:shadow-lg transition-shadow group">
              <div className="flex items-center">
                <div className="p-4 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                  <FiUsers className="w-8 h-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Find Doctors</h3>
                  <p className="text-gray-500">Browse and book appointments with doctors</p>
                </div>
              </div>
            </Link>

            <Link href="/patient/appointments" className="card hover:shadow-lg transition-shadow group">
              <div className="flex items-center">
                <div className="p-4 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <FiCalendar className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">My Appointments</h3>
                  <p className="text-gray-500">View and manage your appointments</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Upcoming Appointments */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              <Link href="/patient/appointments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
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
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {appointment.doctorName?.charAt(0) || 'D'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">
                          Dr. {appointment.doctorName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.specialization}
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
                <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming appointments</p>
                <Link href="/patient/doctors" className="btn-primary mt-4 inline-block">
                  Book an Appointment
                </Link>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
