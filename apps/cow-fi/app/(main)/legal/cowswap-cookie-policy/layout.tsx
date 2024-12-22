import { Metadata } from 'next'
import { getPageMetadata } from '@/util/getPageMetadata'
import { CONFIG } from '@/const/meta'

export const metadata: Metadata = getPageMetadata({
  absoluteTitle: 'CoW Swap - Cookie policy',
  description: CONFIG.description,
})

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
