'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import AdminLayout from '@/components/AdminLayout'
import VehicleModelsManager from '@/components/VehicleModelsManager'

export default function VehicleModelsPage() {
  return (
    <ProtectedRoute requiredPermission="vehicle-models:read">
      <AdminLayout>
        <VehicleModelsManager />
      </AdminLayout>
    </ProtectedRoute>
  )
}
