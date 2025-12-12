'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiBriefcase, FiDollarSign, FiCalendar, FiClock, FiArrowLeft } from 'react-icons/fi';

export default function BookAppointment() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  
  const [formData, setFormData] = useState({
    appointmentDate: '',
    timeSlot: '',
    reason: '',
    symptoms: ''
  });

  const AUTH_API = process.env.AUTH_API_URL || 'http://localhost:4001';
  const APPOINTMENT_API = process.env.APPOINTMENT_API_URL || 'http://localhost:4002';

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
    '04:30 PM', '05:00 PM'
  ];

  useEffect(() => {
    fetchDoctor();
  }, [params.id]);

  useEffect(() => {
    if (formData.appointmentDate && doctor) {
      fetchBookedSlots();
    }
  }, [formData.appointmentDate, doctor]);

  const fetchDoctor = async () => {
    try {
      const res = await fetch(`${AUTH_API}/api/auth/doctors/${params.id}`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setDoctor(data.doctor);
      } else {
        toast.error('Doctor not found');
        router.push('/patient/doctors');
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
      toast.error('Error loading doctor details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedSlots = async () => {
    try {
      const res = await fetch(
        `${APPOINTMENT_API}/api/appointments/slots/${params.id}?date=${formData.appointmentDate}`,
        { credentials: 'include' }
      );
      
      if (res.ok) {
        const data = await res.json();
        setBookedSlots(data.bookedSlots || []);
      }
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.appointmentDate || !formData.timeSlot || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    setBooking(true);
    
    try {
      const res = await fetch(`${APPOINTMENT_API}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          doctorId: doctor._id,
          doctorName: doctor.name,
          doctorEmail: doctor.email,
          specialization: doctor.specialization,
          consultationFee: doctor.consultationFee,
          patientName: user.name,
          patientEmail: user.email,
          appointmentDate: formData.appointmentDate,
          timeSlot: formData.timeSlot,
          reason: formData.reason,
          symptoms: formData.symptoms
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Appointment booked successfully!');
        router.push('/patient/appointments');
      } else {
        toast.error(data.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('An error occurred while booking');
    } finally {
      setBooking(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['patient']}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2" />
            Back to Doctors
          </button>

          {/* Doctor Info Card */}
          <div className="card">
            <div className="flex items-start">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FiUser className="w-10 h-10 text-primary-600" />
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-900">Dr. {doctor?.name}</h1>
                <p className="text-primary-600">{doctor?.specialization}</p>
                <p className="text-gray-500">{doctor?.qualification}</p>
                
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center text-gray-600">
                    <FiBriefcase className="mr-2" />
                    {doctor?.experience} years
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiDollarSign className="mr-2" />
                    ${doctor?.consultationFee}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Book Appointment</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline mr-2" />
                  Select Date *
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={getMinDate()}
                  className="input-field"
                  required
                />
              </div>

              {/* Time Slot Selection */}
              {formData.appointmentDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiClock className="inline mr-2" />
                    Select Time Slot *
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {timeSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = formData.timeSlot === slot;
                      
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setFormData({ ...formData, timeSlot: slot })}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            isBooked
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isSelected
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit *
                </label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Regular checkup, Follow-up, etc."
                  required
                />
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe Your Symptoms (Optional)
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  className="input-field"
                  rows="3"
                  placeholder="Describe any symptoms you're experiencing..."
                />
              </div>

              {/* Summary */}
              {formData.appointmentDate && formData.timeSlot && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Appointment Summary</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Doctor: Dr. {doctor?.name}</p>
                    <p>Date: {new Date(formData.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                    <p>Time: {formData.timeSlot}</p>
                    <p>Consultation Fee: ${doctor?.consultationFee}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={booking || !formData.appointmentDate || !formData.timeSlot}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
