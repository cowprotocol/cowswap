import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Topics',
}

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
