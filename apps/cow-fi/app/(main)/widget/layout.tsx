import { Metadata } from 'next'
import { getPageMetadata } from '@/util/getPageMetadata'

export const metadata: Metadata = {
  ...getPageMetadata({
    title: 'Widget - Bring reliable, MEV-protected swaps to your users',
    description: 'Integrate the CoW Swap widget to bring seamless, MEV-protected trading to your website or dApp',
  }),
}

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
