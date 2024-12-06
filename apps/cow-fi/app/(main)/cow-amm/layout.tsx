import { Metadata } from 'next'
import { getPageMetadata } from '@/util/getPageMetadata'
import { CONFIG } from '@/const/meta'

export const metadata: Metadata = {
  ...getPageMetadata({
    title: 'CoW AMM - The first MEV-capturing AMM, now live on Balancer',
    description: 'CoW AMM protects LPs from LVR so they can provide liquidity with less risk and more return',
    image: CONFIG.ogImageCOWAMM,
  }),
}

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
