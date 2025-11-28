import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { CHAIN_INFO } from '@cowprotocol/common-const'
import { getRandomInt } from '@cowprotocol/common-utils'
import { SupportedChainId, ChainInfo } from '@cowprotocol/cow-sdk'
import { BigNumber } from '@ethersproject/bignumber'

import styled from 'styled-components/macro'

import { allTokensMock, favoriteTokensMock } from '../../mocks'
import { mapChainInfo } from '../../utils/mapChainInfo'
import { ChainPanel } from '../ChainPanel'

import { SelectTokenModal, SelectTokenModalProps } from './index'

const Wrapper = styled.div`
  max-height: 90vh;
  margin: 20px auto;
  display: flex;
  gap: 0;
  width: 960px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
`

const unsupportedTokens = {}

const selectedToken = favoriteTokensMock[0]

const balances = allTokensMock.reduce<BalancesState['values']>((acc, token) => {
  acc[token.address] = BigNumber.from(getRandomInt(20_000, 120_000_000) + '0'.repeat(token.decimals))

  return acc
}, {})

const chainsMock: ChainInfo[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.BASE,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.POLYGON,
  SupportedChainId.AVALANCHE,
  SupportedChainId.GNOSIS_CHAIN,
].reduce<ChainInfo[]>((acc, id) => {
  const info = CHAIN_INFO[id]

  if (info) {
    acc.push(mapChainInfo(id, info))
  }

  return acc
}, [])

const favoriteTokenAddresses = new Set(favoriteTokensMock.map((token) => token.address.toLowerCase()))
const recentTokensMock = allTokensMock.filter((token) => !favoriteTokenAddresses.has(token.address.toLowerCase())).slice(0, 3)

const defaultModalProps: SelectTokenModalProps = {
  tokenListTags: {},
  account: undefined,
  permitCompatibleTokens: {},
  unsupportedTokens,
  allTokens: allTokensMock,
  favoriteTokens: favoriteTokensMock,
  recentTokens: recentTokensMock,
  areTokensLoading: false,
  areTokensFromBridge: false,
  tokenListCategoryState: [null, () => void 0],
  balancesState: {
    values: balances,
    isLoading: false,
    chainId: SupportedChainId.SEPOLIA,
    fromCache: false,
  },
  selectedToken,
  isRouteAvailable: true,
  modalTitle: 'Swap from',
  onSelectChain: () => undefined,
  onSelectToken() {
    console.log('onSelectToken')
  },
  onTokenListItemClick(token) {
    console.log('onTokenListItemClick', token.symbol)
  },
  onOpenManageWidget() {
    console.log('onOpenManageWidget')
  },
  onDismiss() {
    console.log('onDismiss')
  },
  openPoolPage() {
    console.log('openPoolPage')
  },
}

const defaultChainPanelProps = {
  title: 'Cross chain swap',
  chainsState: {
    defaultChainId: SupportedChainId.MAINNET,
    chains: chainsMock,
    isLoading: false,
  },
  onSelectChain(chain: ChainInfo) {
    console.log('onSelectChain', chain)
  },
}

const Fixtures = {
  default: () => (
    <Wrapper>
      <SelectTokenModal {...defaultModalProps} hasChainPanel />
      <ChainPanel {...defaultChainPanelProps} />
    </Wrapper>
  ),
  loadingSidebar: () => (
    <Wrapper>
      <SelectTokenModal {...defaultModalProps} hasChainPanel />
      <ChainPanel
        {...defaultChainPanelProps}
        chainsState={{ chains: [], isLoading: true, defaultChainId: SupportedChainId.MAINNET }}
      />
    </Wrapper>
  ),
  noSidebar: () => (
    <Wrapper>
      <SelectTokenModal {...defaultModalProps} />
    </Wrapper>
  ),
  importByAddress: () => (
    <Wrapper>
      <SelectTokenModal defaultInputValue={'0x252d98fab648203aa33310721bbbddfa8f1b6587'} {...defaultModalProps} />
    </Wrapper>
  ),
  NoTokenFound: () => (
    <Wrapper>
      <SelectTokenModal defaultInputValue={'0x543ff227f64aa17ea132bf9886cab5db55dcaddd'} {...defaultModalProps} />
    </Wrapper>
  ),
  searchFromInactiveLists: () => (
    <Wrapper>
      <SelectTokenModal defaultInputValue={'cDAI'} {...defaultModalProps} />
    </Wrapper>
  ),
  searchFromExternalSources: () => (
    <Wrapper>
      <SelectTokenModal defaultInputValue={'Coo'} {...defaultModalProps} />
    </Wrapper>
  ),
}

export default Fixtures
