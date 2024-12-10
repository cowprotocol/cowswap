import { Metadata } from 'next'
import { getPageMetadata } from '@/util/getPageMetadata'
import { CONFIG } from '@/const/meta'

export const metadata: Metadata = {
  ...getPageMetadata({
    absoluteTitle: 'DAOs - Savvy DAOs Choose CoW Swap',
    description: 'The smartest DAOs trust CoW Swap with their most-important trades',
  }),
}

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
