'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { FiSearch, FiUser, FiStar, FiBriefcase, FiDollarSign } from 'react-icons/fi';

export default function FindDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');

  const AUTH_API = process.env.AUTH_API_URL || 'http://localhost:4001';

  const specializations = [
    'All',
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Orthopedic',
    'Pediatrician',
    'Psychiatrist',
    'Gynecologist',
    'ENT Specialist',
    'Ophthalmologist',
    'Dentist',
  ];

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialization]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = selectedSpecialization && selectedSpecialization !== 'All'
        ? `?specialization=${selectedSpecialization}`
        : '';
      
      const res = await fetch(`${AUTH_API}/api/auth/doctors${params}`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setDoctors(data.doctors || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Find Doctors</h1>
            <p className="text-gray-500 mt-1">Browse and book appointments with our qualified doctors</p>
          </div>

          {/* Search and Filter */}
          <div className="card">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="input-field md:w-64"
              >
                {specializations.map((spec) => (
                  <option key={spec} value={spec === 'All' ? '' : spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctors Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading doctors...</p>
            </div>
          ) : filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div key={doctor._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiUser className="w-8 h-8 text-primary-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-gray-900">Dr. {doctor.name}</h3>
                      <p className="text-primary-600 text-sm">{doctor.specialization}</p>
                      <p className="text-gray-500 text-sm">{doctor.qualification}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiBriefcase className="w-4 h-4 mr-2" />
                      {doctor.experience} years experience
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiDollarSign className="w-4 h-4 mr-2" />
                      ${doctor.consultationFee} per consultation
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Link
                      href={`/patient/doctors/${doctor._id}`}
                      className="btn-primary w-full text-center block"
                    >
                      Book Appointment
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <FiUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No doctors found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
