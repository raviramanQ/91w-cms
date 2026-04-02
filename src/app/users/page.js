'use client'

import AdminLayout from '@/components/AdminLayout'
import UsersManager from '@/components/UsersManager'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function UsersPage() {
  return (
    <ProtectedRoute requiredPermission="users:read">
      <AdminLayout>
        <UsersManager />
      </AdminLayout>
    </ProtectedRoute>
  )
}
