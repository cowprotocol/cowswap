import { Metadata } from 'next'

import { getPageMetadata } from '@/util/getPageMetadata'

export const metadata: Metadata = {
  ...getPageMetadata({
    title: 'CoW Protocol on Solana - Solana, let’s get serious',
    description:
      'Build on CoW Protocol on Solana, the DEX partner that gives you more: more surplus, more protection and more advanced capabilities',
  }),
}

export default function LayoutPage({ children }: { children: React.ReactNode }): React.ReactNode {
  return children
}
