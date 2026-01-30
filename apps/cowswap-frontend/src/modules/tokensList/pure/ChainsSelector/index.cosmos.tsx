import { CHAIN_INFO } from '@cowprotocol/common-const'
import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'

import styled from 'styled-components/macro'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade/types'

import { mapChainInfo } from '../../utils/mapChainInfo'

import { ChainsSelector } from './index'

const chains: ChainInfo[] = Object.keys(CHAIN_INFO).map((chainId) => {
  const supportedChainId = Number(chainId) as SupportedChainId
  const info = CHAIN_INFO[supportedChainId]

  return mapChainInfo(supportedChainId, info)
})

const Wrapper = styled.div`
  width: 320px;
`

const Fixtures = {
  default: () => (
    <Wrapper>
      <ChainsSelector
        chains={chains}
        isLoading={false}
        onSelectChain={(chain) => console.log('Chain selected: ', chain.label)}
        tradeType={TradeType.SWAP}
        field={Field.INPUT}
        counterChainId={chains[1]?.id}
      />
    </Wrapper>
  ),
  loading: () => (
    <Wrapper>
      <ChainsSelector chains={[]} isLoading={true} onSelectChain={() => undefined} />
    </Wrapper>
  ),
}

export default Fixtures
