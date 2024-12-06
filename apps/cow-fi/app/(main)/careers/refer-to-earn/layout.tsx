import { Metadata } from 'next'
import { getPageMetadata } from '@/util/getPageMetadata'

export const metadata: Metadata = getPageMetadata({
  title: 'Refer-to-Earn - CoW DAO',
  description:
    'Know someone who is not just looking for a job but for a great opportunity to grow? Refer them to us to earn $6,000 in USDC or USD.',
})

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
