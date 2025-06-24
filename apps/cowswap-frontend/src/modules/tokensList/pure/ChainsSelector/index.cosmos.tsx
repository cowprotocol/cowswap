import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId, ChainInfo } from '@cowprotocol/cow-sdk'

import styled from 'styled-components/macro'

import { mapChainInfo } from '../../utils/mapChainInfo'

import { ChainsSelector } from './index'

const chains: ChainInfo[] = [
  ...Object.keys(CHAIN_INFO).map((chainId) => {
    const supportedChainId = +chainId as SupportedChainId
    const info = CHAIN_INFO[supportedChainId]

    return mapChainInfo(supportedChainId, info)
  }),
]

const Wrapper = styled.div`
  width: 450px;
`

const Fixtures = {
  default: () => (
    <Wrapper>
      <ChainsSelector
        chains={chains}
        isLoading={false}
        onSelectChain={(chainId) => console.log('Chain selected: ', chainId)}
      />
    </Wrapper>
  ),
}

export default Fixtures
