import { Metadata } from 'next'
import { getPageMetadata } from '@/util/getPageMetadata'

export const metadata: Metadata = getPageMetadata({
  title: 'Knowledge base topics',
  description: 'All knowledge base topics',
})

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
