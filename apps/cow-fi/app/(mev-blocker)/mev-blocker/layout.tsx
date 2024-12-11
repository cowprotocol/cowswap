import { Metadata } from 'next'
import { getPageMetadata } from '@/util/getPageMetadata'
import { CONFIG } from '@/const/meta'

export const metadata: Metadata = {
  ...getPageMetadata({
    title: 'Mev Blocker - The best MEV protection under the sun',
    description:
      'MEV Blocker is your personal protection from frontrunning and sandwich attacks for a broad spectrum of Ethereum transactions',
    image: CONFIG.ogImageMEVBLOCKER,
  }),
}

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
