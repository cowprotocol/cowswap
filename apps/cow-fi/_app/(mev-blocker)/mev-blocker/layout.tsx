import { Metadata } from 'next'

import { CONFIG } from '@/const/meta'
import { getPageMetadata } from '@/util/getPageMetadata'

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  ...getPageMetadata({
    title: 'MEV Blocker - Has been acquired',
    description: 'MEV Blocker has been acquired. You will be redirected shortly to the new home of MEV Blocker.',
    image: CONFIG.ogImageMEVBLOCKER,
  }),
}

export default function LayoutPage({ children }: { children: React.ReactNode }): React.ReactNode {
  return children
}
