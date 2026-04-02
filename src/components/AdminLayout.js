'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, Car, Truck, Plus, Sparkles, LogOut, User, Home, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // Define all navigation items with their required permissions
  const allNavItems = [
    { href: '/home', label: 'Dashboard', icon: Home, color: 'blue-700', permission: null }, // Always visible
    { href: '/users', label: 'Users', icon: User, color: 'blue-700', permission: 'users:read' },
    { href: '/vehicle-types', label: 'Vehicle Types', icon: Car, color: 'blue-700', permission: 'vehicle-types:read' },
    { href: '/vehicle-makes', label: 'Vehicle Makes', icon: Truck, color: 'blue-700', permission: 'vehicle-makes:read' },
    { href: '/settings', label: 'Settings', icon: Settings, color: 'blue-700', permission: 'settings:read' },
  ]

  // Filter navigation items based on user permissions
  const navItems = allNavItems.filter(item => {
    // Home is always visible
    if (!item.permission) return true
    
    // Admin and superadmin have access to all modules
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      return true
    }
    
    // Check if user has permission
    if (user && user.permissions) {
      const [moduleName, action] = item.permission.split(':')
      
      // Permissions are now in array format: [{module, actions: []}]
      const modulePermission = user.permissions.find(p => p.module === moduleName)
      if (modulePermission && modulePermission.actions) {
        return modulePermission.actions.includes(action)
      }
    }
    
    return false
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/images/91wheels-logo.svg" 
                alt="91Wheels Logo" 
                className="h-10 w-auto object-contain"
              />
             </div>
            <div className="flex items-center space-x-3">
              {user && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleTheme}
                    className="shadow-sm hover:shadow-md transition-all"
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-blue-600" />
                    )}
                  </Button>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={logout}
                    className="shadow-sm hover:shadow-md transition-shadow hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg border-r border-gray-200/50 dark:border-gray-700/50 min-h-screen">
          <nav className="mt-6 px-4">
            <div className="mb-6">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <span className="text-sm font-medium text-blue-900">Admin Panel 91Wheels</span>
              </div>
            </div>
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-'+ item.color + ' text-white shadow-lg shadow-blue-500/30 scale-105'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md hover:scale-102'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-colors ${
                      isActive 
                        ? 'bg-white/20' 
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gradient-to-br group-hover:' + item.color + ' group-hover:text-white'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </Link>
                )
              })}
            </div>
            
            {/* Sidebar Footer */}
            <div className="mt-8 px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <p className="text-xs font-medium text-gray-700 mb-1">💡 HELP</p>
              <p className="text-xs text-gray-600">For any issues, please contact support team @91wheels Tech.</p>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
