import { CHAIN_INFO, RPC_URLS } from '@cowprotocol/common-const'
import { SupportedChainId, ChainInfo } from '@cowprotocol/cow-sdk'

import styled from 'styled-components/macro'

import { ChainsSelector } from './index'

const chains: ChainInfo[] = [
  ...Object.keys(CHAIN_INFO).map((chainId) => {
    const info = CHAIN_INFO[+chainId as SupportedChainId]

    return {
      id: +chainId,
      addressPrefix: info.addressPrefix,
      contracts: {},
      docs: {
        url: info.docs,
        name: '',
      }, // TODO
      isTestnet: false, // TODO
      rpcUrls: {
        default: {
          http: [RPC_URLS[SupportedChainId.MAINNET]],
        },
      }, // TODO
      website: {
        url: '',
        name: '',
      }, // TODO
      label: info.label,
      nativeCurrency: {
        ...info.nativeCurrency,
        name: info.nativeCurrency.name || '',
        symbol: info.nativeCurrency.symbol || '',
      },
      blockExplorer: {
        url: info.explorer,
        name: info.explorerTitle,
      },
      logo: {
        light: info.logo.light,
        dark: info.logo.dark,
      },
      color: info.color,
    }
  }),
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
