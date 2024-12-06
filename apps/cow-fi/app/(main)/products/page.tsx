'use client'

import { Color } from '@cowprotocol/ui'
import { PRODUCT_CONTAINERS } from '@/data/home/const'

import { PageWrapper, ContainerCard } from '@/styles/styled'

export default function Page() {
  return (
    <PageWrapper>
      <ContainerCard bgColor={Color.neutral100} touchFooter>
        {PRODUCT_CONTAINERS}
      </ContainerCard>
    </PageWrapper>
  )
}
