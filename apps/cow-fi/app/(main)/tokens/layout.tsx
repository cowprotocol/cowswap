import { Metadata } from 'next'
import { getPageMetadata } from '@/util/getPageMetadata'

export const metadata: Metadata = {
  ...getPageMetadata({
    title: 'Tokens - CoW DAO',
    description:
      "Track the latest tokens price, market cap, trading volume, and more with CoW DAO's live token price tracker",
  }),
}

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
