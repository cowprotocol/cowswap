import { Color } from '@cowprotocol/ui'
import Layout from '@/components/Layout'
import { PRODUCT_CONTAINERS } from '@/data/home/const'

import { PageWrapper, ContainerCard } from '@/styles/styled'

export default function Page() {
  return (
    <Layout bgColor={Color.neutral90}>
      <PageWrapper>
        <ContainerCard bgColor={Color.neutral100} touchFooter>
          {PRODUCT_CONTAINERS}
        </ContainerCard>
      </PageWrapper>
    </Layout>
  )
}
