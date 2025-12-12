'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiDollarSign, FiBriefcase, FiAward, FiPlus, FiTrash2 } from 'react-icons/fi';

export default function DoctorProfile() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    specialization: user?.specialization || '',
    qualification: user?.qualification || '',
    experience: user?.experience || '',
    consultationFee: user?.consultationFee || '',
    availableSlots: user?.availableSlots || []
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addSlot = () => {
    setFormData({
      ...formData,
      availableSlots: [
        ...formData.availableSlots,
        { day: 'Monday', startTime: '09:00', endTime: '17:00' }
      ]
    });
  };

  const updateSlot = (index, field, value) => {
    const newSlots = [...formData.availableSlots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setFormData({ ...formData, availableSlots: newSlots });
  };

  const removeSlot = (index) => {
    const newSlots = formData.availableSlots.filter((_, i) => i !== index);
    setFormData({ ...formData, availableSlots: newSlots });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const dataToUpdate = {
      ...formData,
      experience: parseInt(formData.experience),
      consultationFee: parseInt(formData.consultationFee)
    };
    
    await updateProfile(dataToUpdate);
    setLoading(false);
  };

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-500 mt-1">Manage your professional information</p>
          </div>

          {/* Profile Card */}
          <div className="card">
            <div className="flex items-center mb-6 pb-6 border-b">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <FiUser className="w-10 h-10 text-green-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">Dr. {user?.name}</h2>
                <p className="text-gray-500">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                  Doctor - {user?.specialization}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <div className="relative">
                    <FiAward className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., MBBS, MD"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (years)
                  </label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="input-field pl-10"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Fee ($)
                  </label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="consultationFee"
                      value={formData.consultationFee}
                      onChange={handleChange}
                      className="input-field pl-10"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Available Slots */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Available Time Slots
                  </label>
                  <button
                    type="button"
                    onClick={addSlot}
                    className="flex items-center text-primary-600 hover:text-primary-700 text-sm"
                  >
                    <FiPlus className="mr-1" />
                    Add Slot
                  </button>
                </div>

                {formData.availableSlots.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4 text-center bg-gray-50 rounded-lg">
                    No availability slots set. Click "Add Slot" to add your working hours.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {formData.availableSlots.map((slot, index) => (
                      <div key={index} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <select
                          value={slot.day}
                          onChange={(e) => updateSlot(index, 'day', e.target.value)}
                          className="input-field w-36"
                        >
                          {days.map((day) => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                            className="input-field w-32"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                            className="input-field w-32"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSlot(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Account Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <FiMail className="mr-3" />
                <span>{user?.email}</span>
                <span className="ml-2 text-xs text-gray-400">(cannot be changed)</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
