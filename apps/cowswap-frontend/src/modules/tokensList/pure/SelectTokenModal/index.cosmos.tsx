import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { CHAIN_INFO } from '@cowprotocol/common-const'
import { getRandomInt } from '@cowprotocol/common-utils'
import { SupportedChainId, ChainInfo } from '@cowprotocol/cow-sdk'
import { BigNumber } from '@ethersproject/bignumber'

import styled from 'styled-components/macro'

import { allTokensMock, favoriteTokensMock } from '../../mocks'
import { mapChainInfo } from '../../utils/mapChainInfo'

import { SelectTokenModal, SelectTokenModalProps } from './index'

const Wrapper = styled.div`
  max-height: 90vh;
  margin: 20px auto;
  display: flex;
  width: 520px;
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
].reduce<ChainInfo[]>((acc, id) => {
  const info = CHAIN_INFO[id]

  if (info) {
    acc.push(mapChainInfo(id, info))
  }

  return acc
}, [])

const defaultProps: SelectTokenModalProps = {
  tokenListTags: {},
  account: undefined,
  permitCompatibleTokens: {},
  unsupportedTokens,
  allTokens: allTokensMock,
  favoriteTokens: favoriteTokensMock,
  areTokensLoading: false,
  areTokensFromBridge: false,
  chainsToSelect: {
    chains: chainsMock,
    isLoading: false,
    defaultChainId: SupportedChainId.MAINNET,
  },
  onSelectChain(chain: ChainInfo) {
    console.log('onSelectChain', chain)
  },
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
  recentTokens: favoriteTokensMock.slice(0, 2),
  selectedTargetChainId: SupportedChainId.SEPOLIA,
  onSelectToken() {
    console.log('onSelectToken')
  },
  onTokenListItemClick(token) {
    console.log('onTokenListItemClick', token.symbol)
  },
  onClearRecentTokens() {
    console.log('onClearRecentTokens')
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

const Fixtures = {
  default: () => (
    <Wrapper>
      <SelectTokenModal {...defaultProps} />
    </Wrapper>
  ),
  importByAddress: () => (
    <Wrapper>
      <SelectTokenModal defaultInputValue={'0x252d98fab648203aa33310721bbbddfa8f1b6587'} {...defaultProps} />
    </Wrapper>
  ),
  NoTokenFound: () => (
    <Wrapper>
      <SelectTokenModal defaultInputValue={'0x543ff227f64aa17ea132bf9886cab5db55dcaddd'} {...defaultProps} />
    </Wrapper>
  ),
  searchFromInactiveLists: () => (
    <Wrapper>
      <SelectTokenModal defaultInputValue={'cDAI'} {...defaultProps} />
    </Wrapper>
  ),
  searchFromExternalSources: () => (
    <Wrapper>
      <SelectTokenModal defaultInputValue={'Coo'} {...defaultProps} />
    </Wrapper>
  ),
}

export default Fixtures
