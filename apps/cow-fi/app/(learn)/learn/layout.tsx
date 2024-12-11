import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Knowledge Base - CoW DAO',
    template: '%s - CoW DAO',
  },
}

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
