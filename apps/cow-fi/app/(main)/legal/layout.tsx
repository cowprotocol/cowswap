import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    absolute: 'Legal - CoW DAO Legal Overview',
  },
}

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
