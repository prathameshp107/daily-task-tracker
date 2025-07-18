'use client'

import { ProtectedRoute } from '../../components/auth'
import { DashboardContent } from '../../components/dashboard/dashboard-content'

/**
 * Dashboard page - main authenticated landing page
 * Uses ProtectedRoute wrapper for authentication
 */
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}