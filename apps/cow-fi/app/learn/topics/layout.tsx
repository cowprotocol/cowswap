import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Topics',
  description: 'All knowledge base topics',
}

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
