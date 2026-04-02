'use client'

import AdminLayout from '@/components/AdminLayout'
import VehicleTypesManager from '@/components/VehicleTypesManager'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function VehicleTypesPage() {
  return (
    <ProtectedRoute requiredPermission="vehicle-types:read">
      <AdminLayout>
        <VehicleTypesManager />
      </AdminLayout>
    </ProtectedRoute>
  )
}
