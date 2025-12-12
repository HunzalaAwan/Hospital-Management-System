'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FiCalendar, FiUsers, FiShield, FiClock, FiHeart, FiStar } from 'react-icons/fi';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <FiHeart className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">HealthCare</span>
            </div>
            <div className="flex items-center space-x-4">
              {!loading && (
                <>
                  {user ? (
                    <Link
                      href={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}
                      className="btn-primary"
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                        Login
                      </Link>
                      <Link href="/auth/register" className="btn-primary">
                        Register
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Your Health, Our Priority
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Book appointments with top healthcare professionals. Easy scheduling,
              secure platform, and quality care at your fingertips.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/auth/register?role=patient" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors">
                Book Appointment
              </Link>
              <Link href="/auth/register?role=doctor" className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-primary-600 transition-colors">
                Join as Doctor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide a seamless healthcare experience with cutting-edge technology
              and compassionate care.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                <FiCalendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Scheduling</h3>
              <p className="text-gray-600">
                Book appointments with just a few clicks. Choose your preferred
                doctor, date, and time slot.
              </p>
            </div>

            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <FiUsers className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Doctors</h3>
              <p className="text-gray-600">
                Access a network of qualified healthcare professionals across
                various specializations.
              </p>
            </div>

            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-4">
                <FiShield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
              <p className="text-gray-600">
                Your health data is protected with industry-standard security
                measures and encryption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started in just three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 text-white font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Account</h3>
              <p className="text-gray-600">
                Sign up as a patient or doctor with your basic information.
              </p>
            </div>

            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 text-white font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Find a Doctor</h3>
              <p className="text-gray-600">
                Browse through our list of qualified doctors and choose one.
              </p>
            </div>

            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 text-white font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Book Appointment</h3>
              <p className="text-gray-600">
                Select a convenient time slot and confirm your appointment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of patients and doctors who trust our platform for
            their healthcare needs.
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <FiHeart className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold text-white">HealthCare</span>
            </div>
            <p className="text-sm">
              © 2024 Healthcare Appointment System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
