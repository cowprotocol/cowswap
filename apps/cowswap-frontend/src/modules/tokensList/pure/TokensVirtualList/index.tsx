import { useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { VirtualItem } from '@tanstack/react-virtual'

import { VirtualList } from 'common/pure/VirtualList'

import { SelectTokenContext } from '../../types'
import { tokensListSorter } from '../../utils/tokensListSorter'
import { TokenListItem } from '../TokenListItem'

export interface TokensVirtualListProps extends SelectTokenContext {
  allTokens: TokenWithLogo[]
  account: string | undefined
}

export function TokensVirtualList(props: TokensVirtualListProps) {
  const { allTokens, selectedToken, balancesState, onSelectToken, unsupportedTokens, permitCompatibleTokens, account } =
    props
  const { values: balances } = balancesState

  const isWalletConnected = !!account

  const sortedTokens = useMemo(() => {
    return balances ? allTokens.sort(tokensListSorter(balances)) : allTokens
  }, [allTokens, balances])

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
        />
      )
    },
    [balances, unsupportedTokens, permitCompatibleTokens, selectedToken, onSelectToken, isWalletConnected],
  )

  return <VirtualList id="tokens-list" items={sortedTokens} getItemView={getItemView} />
}
