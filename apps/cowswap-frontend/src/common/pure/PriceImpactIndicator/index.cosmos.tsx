import { ReactNode, useMemo } from 'react'

import { UI } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import { useSelect, useValue } from 'react-cosmos/client'
import styled from 'styled-components/macro'

import { PriceImpactIndicator } from './index'

const Wrapper = styled.div`
  width: 400px;
  height: 400px;
  background: var(${UI.COLOR_PAPER});
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 100px;
`

const Custom = ({ loading = false }: { loading?: boolean }): ReactNode => {
  const [impactPercent] = useValue('impactPercent', { defaultValue: 0 })

  const [isBridging] = useSelect('isBridging', {
    options: ['true', 'false'],
    defaultValue: 'false',
  })

  const priceImpactParams = useMemo(() => {
    return {
      priceImpact: new Percent(impactPercent, 100),
      loading,
    }
  }, [impactPercent, loading])

  return <PriceImpactIndicator priceImpactParams={priceImpactParams} isBridging={isBridging === 'true'} />
}

const SpinnerFixtures = {
  loading: (
    <Wrapper>
      <Custom loading />
    </Wrapper>
  ),
  priceImpact: (
    <Wrapper>
      <Custom />
    </Wrapper>
  ),
}

export default SpinnerFixtures
