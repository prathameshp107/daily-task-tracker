import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Auto Fetch Tasks - Daily Task Tracker',
  description: 'Automatically fetch and manage your daily tasks and boost your productivity',
}

export default function AutoFetchTasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}