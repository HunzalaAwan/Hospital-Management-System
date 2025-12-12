'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  FiHome, 
  FiCalendar, 
  FiUsers, 
  FiUser, 
  FiBell, 
  FiLogOut,
  FiHeart,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useState } from 'react';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDoctor = user?.role === 'doctor';
  const baseUrl = isDoctor ? '/doctor' : '/patient';

  const navigation = isDoctor
    ? [
        { name: 'Dashboard', href: `${baseUrl}/dashboard`, icon: FiHome },
        { name: 'Appointments', href: `${baseUrl}/appointments`, icon: FiCalendar },
        { name: 'Profile', href: `${baseUrl}/profile`, icon: FiUser },
      ]
    : [
        { name: 'Dashboard', href: `${baseUrl}/dashboard`, icon: FiHome },
        { name: 'Find Doctors', href: `${baseUrl}/doctors`, icon: FiUsers },
        { name: 'My Appointments', href: `${baseUrl}/appointments`, icon: FiCalendar },
        { name: 'Profile', href: `${baseUrl}/profile`, icon: FiUser },
      ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-md"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b">
            <FiHeart className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">HealthCare</span>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <p className="text-sm text-gray-500">Welcome back,</p>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
              isDoctor ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {isDoctor ? 'Doctor' : 'Patient'}
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 py-4 border-t">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiLogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
