import { Color } from '@cowprotocol/ui'
import Layout from '@/components/Layout'

import {
  PageWrapper,
} from '@/styles/styled'

import { CONFIG } from '@/const/meta'
import { Products } from '@/components/Products'

interface PageProps {
  siteConfigData: typeof CONFIG
}

export default function Page() {
  return (
    <Layout bgColor={Color.neutral90}>
      <PageWrapper>
        <Products />
      </PageWrapper>
    </Layout>
  )
}