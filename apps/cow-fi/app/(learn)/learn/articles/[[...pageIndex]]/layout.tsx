import { Metadata } from 'next'
import { getPageMetadata } from '@/util/getPageMetadata'

export const metadata: Metadata = getPageMetadata({
  title: 'All articles',
  description: 'All knowledge base articles in the Cow DAO ecosystem',
})

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
