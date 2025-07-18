import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Daily Task Tracker',
  description: 'Manage your daily tasks and boost your productivity',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}