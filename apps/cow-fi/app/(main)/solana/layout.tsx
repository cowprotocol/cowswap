import { Metadata } from 'next'

import { getPageMetadata } from '@/util/getPageMetadata'

export const metadata: Metadata = {
  ...getPageMetadata({
    title: 'Solana - MEV-protected, surplus-capturing swaps on Solana',
    description:
      'CoW Swap is live on Solana. Trade SPL tokens with intents, batch auctions and solver competition - the same protection you know from Ethereum',
  }),
}

export default function LayoutPage({ children }: { children: React.ReactNode }): React.ReactNode {
  return children
}
