import { Metadata } from 'next'
import { getPageMetadata } from '@/util/getPageMetadata'
import { CONFIG } from '@/const/meta'

export const metadata: Metadata = {
  ...getPageMetadata({
    absoluteTitle: 'CoW Protocol - Do what you want, build what you want',
    description:
      'CoW Protocol has the largest solver competition and the most advanced developer framework - so you can build any DEX-related action you can imagine',
    image: CONFIG.ogImageCOWPROTOCOL,
  }),
}

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
