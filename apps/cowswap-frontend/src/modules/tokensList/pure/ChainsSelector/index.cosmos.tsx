import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ChainInfo, TokenInfo } from '@cowprotocol/types'

import styled from 'styled-components/macro'

import { testNetworks } from 'modules/bridge/mocks'

import { ChainsSelector } from './index'

const chains: ChainInfo[] = [
  ...Object.keys(CHAIN_INFO).map((chainId) => {
    const info = CHAIN_INFO[+chainId as SupportedChainId]

    return {
      id: +chainId,
      name: info.name,
      nativeCurrency: info.nativeCurrency as TokenInfo,
      isEvmChain: true,
      blockExplorer: info.explorer,
      logoUrl: {
        light: info.logo.light,
        dark: info.logo.dark,
      },
      mainColor: info.color,
    }
  }),
  ...testNetworks,
]

const Wrapper = styled.div`
  width: 450px;
`

const Fixtures = {
  default: (
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
