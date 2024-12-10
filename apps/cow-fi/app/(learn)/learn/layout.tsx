import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Knowledge Base',
    template: '%s - Knowledge Base - CoW DAO',
  },
}

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
