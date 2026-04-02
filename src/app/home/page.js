'use client'

import { useAuth } from '@/contexts/AuthContext'
import AdminLayout from '@/components/AdminLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'
import { Car, Truck, Settings, Users, FileText, FolderOpen } from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()

  // Define all available modules with their metadata
  const allModules = [
    {
      id: 'vehicle-types',
      name: 'Vehicle Types',
      description: 'Manage vehicle categories like Cars, Bikes, Scooters',
      icon: Car,
      href: '/vehicle-types',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      permission: 'vehicle-types:read'
    },
    {
      id: 'vehicle-makes',
      name: 'Vehicle Makes',
      description: 'Manage vehicle manufacturers and brands',
      icon: Truck,
      href: '/vehicle-makes',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      permission: 'vehicle-makes:read'
    },
    {
      id: 'users',
      name: 'Users',
      description: 'Manage system users and permissions',
      icon: Users,
      href: '/users',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      permission: 'users:read'
    },
    {
      id: 'posts',
      name: 'Posts',
      description: 'Manage blog posts and articles',
      icon: FileText,
      href: '/posts',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      permission: 'posts:read'
    },
    {
      id: 'categories',
      name: 'Categories',
      description: 'Manage content categories',
      icon: FolderOpen,
      href: '/categories',
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      permission: 'categories:read'
    },
    {
      id: 'settings',
      name: 'Settings',
      description: 'System configuration and settings',
      icon: Settings,
      href: '/settings',
      color: 'from-gray-500 to-slate-500',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600',
      permission: 'settings:read'
    }
  ]

  // Filter modules based on user permissions
  const getAccessibleModules = () => {
    if (!user || !user.permissions) return []

    // Admin and superadmin have access to all modules
    if (user.role === 'admin' || user.role === 'superadmin') {
      return allModules
    }

    return allModules.filter(module => {
      const [moduleName, action] = module.permission.split(':')
      
      // Permissions are now in array format: [{module, actions: []}]
      const modulePermission = user.permissions.find(p => p.module === moduleName)
      if (modulePermission && modulePermission.actions) {
        return modulePermission.actions.includes(action)
      }
      
      return false
    })
  }

  const accessibleModules = getAccessibleModules()

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              {user?.role && <span className="capitalize font-medium">{user.role}</span>} • 
              {' '}You have access to {accessibleModules.length} module{accessibleModules.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Modules</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{accessibleModules.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Role</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2 capitalize">{user?.role || 'User'}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quick Access</p>
                  <p className="text-sm text-gray-500 mt-2">Click any module below</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Modules Grid */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Modules</h2>
            
            {accessibleModules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accessibleModules.map((module) => {
                  const Icon = module.icon
                  return (
                    <Link
                      key={module.id}
                      href={module.href}
                      className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      <div className={`w-14 h-14 ${module.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-7 h-7 ${module.iconColor}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {module.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {module.description}
                      </p>
                      <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                        Open Module
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Modules Available</h3>
                <p className="text-gray-600">
                  You don't have access to any modules yet. Please contact your administrator to get permissions.
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {accessibleModules.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accessibleModules.slice(0, 4).map((module) => (
                  <Link
                    key={`quick-${module.id}`}
                    href={module.href}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`w-10 h-10 ${module.bgColor} rounded-lg flex items-center justify-center mr-3`}>
                      <module.icon className={`w-5 h-5 ${module.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-blue-600">{module.name}</p>
                      <p className="text-xs text-gray-500">Manage {module.name.toLowerCase()}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
