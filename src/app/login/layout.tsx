import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Daily Task Tracker',
  description: 'Sign in to your Daily Task Tracker account',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}