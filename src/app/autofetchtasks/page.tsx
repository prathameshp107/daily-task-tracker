'use client'

import { ProtectedRoute } from '../../components/auth'
import { AutoFetchDashboardContent } from '../../components/dashboard/auto-fetch-dashboard-content'

/**
 * Auto Fetch Tasks page - main authenticated landing page
 * Uses ProtectedRoute wrapper for authentication
 */
export default function AutoFetchTasksPage() {
  return (
    <ProtectedRoute>
      <AutoFetchDashboardContent />
    </ProtectedRoute>
  )
}