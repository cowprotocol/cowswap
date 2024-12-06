import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All articles',
}

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
