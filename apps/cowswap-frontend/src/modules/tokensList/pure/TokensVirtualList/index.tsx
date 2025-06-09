import { useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { VirtualItem } from '@tanstack/react-virtual'

import { CoWAmmBanner } from 'common/containers/CoWAmmBanner'
import { VirtualList } from 'common/pure/VirtualList'

import { SelectTokenContext } from '../../types'
import { tokensListSorter } from '../../utils/tokensListSorter'
import { TokenListItem } from '../TokenListItem'

export interface TokensVirtualListProps extends SelectTokenContext {
  allTokens: TokenWithLogo[]
  account: string | undefined
  displayLpTokenLists?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TokensVirtualList(props: TokensVirtualListProps) {
  const {
    allTokens,
    selectedToken,
    balancesState,
    onSelectToken,
    unsupportedTokens,
    permitCompatibleTokens,
    tokenListTags,
    account,
    displayLpTokenLists,
  } = props
  const { values: balances } = balancesState

  const isWalletConnected = !!account
  const { isYieldEnabled } = useFeatureFlags()

  const sortedTokens = useMemo(() => balances ? allTokens.sort(tokensListSorter(balances)) : allTokens, [allTokens, balances])

  const getItemView = useCallback(
    (sortedTokens: TokenWithLogo[], virtualRow: VirtualItem) => {
      const token = sortedTokens[virtualRow.index]
      const addressLowerCase = token.address.toLowerCase()
      const balance = balances ? balances[token.address.toLowerCase()] : undefined

      return (
        <TokenListItem
          token={token}
          isUnsupported={!!unsupportedTokens[addressLowerCase]}
          isPermitCompatible={permitCompatibleTokens[addressLowerCase]}
          selectedToken={selectedToken}
          balance={balance}
          onSelectToken={onSelectToken}
          isWalletConnected={isWalletConnected}
          tokenListTags={tokenListTags}
        />
      )
    },
    [
      balances,
      unsupportedTokens,
      permitCompatibleTokens,
      selectedToken,
      onSelectToken,
      isWalletConnected,
      tokenListTags,
    ],
  )

  return (
    <VirtualList id="tokens-list" items={sortedTokens} getItemView={getItemView}>
      {displayLpTokenLists || !isYieldEnabled ? null : <CoWAmmBanner isTokenSelectorView />}
    </VirtualList>
  )
}
