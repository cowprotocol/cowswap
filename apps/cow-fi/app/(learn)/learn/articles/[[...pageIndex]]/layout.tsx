import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All articles',
  description: 'All knowledge base articles in the Cow DAO ecosystem',
}

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
