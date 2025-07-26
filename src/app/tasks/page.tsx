'use client'

import { ProtectedRoute } from '../../components/auth'
import { DashboardContent } from '../../components/dashboard/dashboard-content'

/**
 * Tasks page - main authenticated landing page
 * Uses ProtectedRoute wrapper for authentication
 */
export default function TasksPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}