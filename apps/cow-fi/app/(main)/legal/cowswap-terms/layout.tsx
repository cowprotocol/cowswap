import { Metadata } from 'next'
import { getPageMetadata } from '@/util/getPageMetadata'
import { CONFIG } from '@/const/meta'

export const metadata: Metadata = getPageMetadata({
  absoluteTitle: 'Chameleaon swap - Terms and Conditions',
  description: CONFIG.description,
})

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
