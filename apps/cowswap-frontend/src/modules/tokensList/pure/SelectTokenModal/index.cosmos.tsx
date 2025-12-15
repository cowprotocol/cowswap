import { useHydrateAtoms } from 'jotai/utils'
import { ReactNode } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { CHAIN_INFO, TokenWithLogo } from '@cowprotocol/common-const'
import { getRandomInt } from '@cowprotocol/common-utils'
import { SupportedChainId, ChainInfo } from '@cowprotocol/cow-sdk'
import { BigNumber } from '@ethersproject/bignumber'

import styled from 'styled-components/macro'

import { allTokensMock, favoriteTokensMock } from '../../mocks'
import { tokenListViewAtom, TokenListViewState } from '../../state/tokenListViewAtom'
import { SelectTokenContext } from '../../types'
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

const selectedToken = favoriteTokensMock[0]

const balances = allTokensMock.reduce<BalancesState['values']>((acc, token) => {
  acc[token.address] = BigNumber.from(getRandomInt(20_000, 120_000_000) + '0'.repeat(token.decimals))
  return acc
}, {})

const balancesState: BalancesState = {
  values: balances,
  isLoading: false,
  chainId: SupportedChainId.SEPOLIA,
  fromCache: false,
}

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
const recentTokensMock = allTokensMock
  .filter((token) => !favoriteTokenAddresses.has(token.address.toLowerCase()))
  .slice(0, 3)

// Mock SelectTokenContext for atom hydration
const mockSelectTokenContext: SelectTokenContext = {
  balancesState,
  selectedToken,
  onSelectToken: (token: TokenWithLogo) => {
    console.log('onSelectToken', token.symbol)
  },
  onTokenListItemClick: (token: TokenWithLogo) => {
    console.log('onTokenListItemClick', token.symbol)
  },
  unsupportedTokens: {},
  permitCompatibleTokens: {},
  tokenListTags: {},
  isWalletConnected: false,
}

// Mock atom state for Cosmos fixtures
const mockAtomState: TokenListViewState = {
  allTokens: allTokensMock,
  favoriteTokens: favoriteTokensMock,
  recentTokens: recentTokensMock,
  searchInput: '',
  areTokensLoading: false,
  areTokensFromBridge: false,
  hideFavoriteTokensTooltip: false,
  displayLpTokenLists: false,
  selectedTargetChainId: undefined,
  selectTokenContext: mockSelectTokenContext,
  onClearRecentTokens: () => console.log('onClearRecentTokens'),
}

// Wrapper component that hydrates the atom for Cosmos fixtures
function CosmosAtomProvider({
  children,
  atomState,
}: {
  children: ReactNode
  atomState: TokenListViewState
}): ReactNode {
  useHydrateAtoms([[tokenListViewAtom, atomState]])
  return <>{children}</>
}

// Slim modal props (new ~17 prop interface)
const defaultModalProps: SelectTokenModalProps = {
  // Layout
  standalone: false,
  hasChainPanel: false,
  modalTitle: 'Swap from',
  chainsPanelTitle: 'Cross chain swap',
  // Chain panel
  onSelectChain: () => undefined,
  // Widget config
  tokenListCategoryState: [null, () => void 0],
  disableErc20: false,
  isRouteAvailable: true,
  account: undefined,
  displayLpTokenLists: false,
  // Callbacks
  onSelectToken: (token) => console.log('onSelectToken', token.symbol),
  openPoolPage: () => console.log('openPoolPage'),
  onOpenManageWidget: () => console.log('onOpenManageWidget'),
  onDismiss: () => console.log('onDismiss'),
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
    <CosmosAtomProvider atomState={mockAtomState}>
      <Wrapper>
        <SelectTokenModal {...defaultModalProps} hasChainPanel />
        <ChainPanel {...defaultChainPanelProps} />
      </Wrapper>
    </CosmosAtomProvider>
  ),
  loadingSidebar: () => (
    <CosmosAtomProvider atomState={{ ...mockAtomState, areTokensLoading: true }}>
      <Wrapper>
        <SelectTokenModal {...defaultModalProps} hasChainPanel />
        <ChainPanel
          {...defaultChainPanelProps}
          chainsState={{ chains: [], isLoading: true, defaultChainId: SupportedChainId.MAINNET }}
        />
      </Wrapper>
    </CosmosAtomProvider>
  ),
  noSidebar: () => (
    <CosmosAtomProvider atomState={mockAtomState}>
      <Wrapper>
        <SelectTokenModal {...defaultModalProps} />
      </Wrapper>
    </CosmosAtomProvider>
  ),
  importByAddress: () => (
    <CosmosAtomProvider atomState={mockAtomState}>
      <Wrapper>
        <SelectTokenModal defaultInputValue={'0x252d98fab648203aa33310721bbbddfa8f1b6587'} {...defaultModalProps} />
      </Wrapper>
    </CosmosAtomProvider>
  ),
  NoTokenFound: () => (
    <CosmosAtomProvider atomState={mockAtomState}>
      <Wrapper>
        <SelectTokenModal defaultInputValue={'0x543ff227f64aa17ea132bf9886cab5db55dcaddd'} {...defaultModalProps} />
      </Wrapper>
    </CosmosAtomProvider>
  ),
  searchFromInactiveLists: () => (
    <CosmosAtomProvider atomState={mockAtomState}>
      <Wrapper>
        <SelectTokenModal defaultInputValue={'cDAI'} {...defaultModalProps} />
      </Wrapper>
    </CosmosAtomProvider>
  ),
  searchFromExternalSources: () => (
    <CosmosAtomProvider atomState={mockAtomState}>
      <Wrapper>
        <SelectTokenModal defaultInputValue={'Coo'} {...defaultModalProps} />
      </Wrapper>
    </CosmosAtomProvider>
  ),
}

export default Fixtures
