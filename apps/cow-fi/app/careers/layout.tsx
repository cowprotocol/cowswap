import { Metadata } from 'next'
import Layout from '@/components/Layout'

export const metadata: Metadata = {
  title: {
    default: 'Careers',
    template: '%s - CoW DAO',
  },
}

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return (
    <Layout
      bgColor={'#F0DEDE'}
      metaTitle={`Careers - CoW DAO`}
      metaDescription="We are an ambitious, fast-growing and international team working at the forefront of DeFi. We believe that we can make markets more fair and more efficient by building the ultimate batch auction settlement layer across EVM-compatible blockchains."
    >
      {children}
    </Layout>
  )
}
