import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tasks - Daily Task Tracker',
  description: 'Manage your daily tasks and boost your productivity',
}

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}