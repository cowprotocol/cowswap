import { Metadata } from 'next'
import { getPageMetadata } from '@/util/getPageMetadata'

export const metadata: Metadata = {
  ...getPageMetadata({
    title: 'Careers - CoW DAO',
    description:
      'We are an ambitious, fast-growing and international team working at the forefront of DeFi. We believe that we can make markets more fair and more efficient by building the ultimate batch auction settlement layer across EVM-compatible blockchains',
  }),
}

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
