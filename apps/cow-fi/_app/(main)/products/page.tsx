'use client'

import { UI } from '@cowprotocol/ui'

import { PRODUCT_CONTAINERS } from '@/data/home/const'
import { PageWrapper, ContainerCard } from '@/styles/styled'

export default function Page() {
  return (
    <PageWrapper>
      <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_100})`} touchFooter>
        {PRODUCT_CONTAINERS}
      </ContainerCard>
    </PageWrapper>
  )
}
