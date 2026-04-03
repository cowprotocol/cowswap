import { Metadata } from 'next'

import { CONFIG } from '@/const/meta'
import { getPageMetadata } from '@/util/getPageMetadata'

export const metadata: Metadata = {
  ...getPageMetadata({
    absoluteTitle: 'CoW Swap Affiliate Program - Moo & Earn',
    description:
      'Turn your influence into income. Share CoW Swap with your audience and earn USDC rewards when referred wallets hit volume milestones.',
    image: CONFIG.ogImageCOWSWAPP,
  }),
}

export default function LayoutPage({ children }: { children: React.ReactNode }): React.ReactNode {
  return children
}
