'use client'

import AdminLayout from '@/components/AdminLayout'
import VehicleMakesManager from '@/components/VehicleMakesManager'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function VehicleMakesPage() {
  return (
    <ProtectedRoute requiredPermission="vehicle-makes:read">
      <AdminLayout>
        <VehicleMakesManager />
      </AdminLayout>
    </ProtectedRoute>
  )
}
