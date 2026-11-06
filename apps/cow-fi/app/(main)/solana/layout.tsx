import { Metadata } from 'next'

import { getPageMetadata } from '@/util/getPageMetadata'

export const metadata: Metadata = {
  ...getPageMetadata({
    title: 'CoW Protocol on Solana - Solana, let’s get serious',
    description:
      'Plug into CoW Protocol on Solana: more solvers competing for every trade, more order types for your users and more ways for your app to earn, all with one integration',
  }),
}

export default function LayoutPage({ children }: { children: React.ReactNode }): React.ReactNode {
  return children
}
