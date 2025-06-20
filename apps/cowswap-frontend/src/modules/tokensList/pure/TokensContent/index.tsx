import React, { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/types'
import { Loader } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Edit } from 'react-feather'

import { TokenSearchResults } from '../../containers/TokenSearchResults'
import { SelectTokenContext } from '../../types'
import { FavoriteTokensList } from '../FavoriteTokensList'
import * as styledEl from '../SelectTokenModal/styled'
import { TokensVirtualList } from '../TokensVirtualList'

export interface TokensContentProps {
  displayLpTokenLists?: boolean
  selectTokenContext: SelectTokenContext
  favoriteTokens: TokenWithLogo[]
  selectedToken?: Nullish<Currency>
  hideFavoriteTokensTooltip?: boolean
  areTokensLoading: boolean
  allTokens: TokenWithLogo[]
  account: string | undefined
  searchInput: string

  onSelectToken(token: TokenWithLogo): void
  onOpenManageWidget(): void
}

export function TokensContent({
  selectTokenContext,
  onSelectToken,
  onOpenManageWidget,
  selectedToken,
  favoriteTokens,
  hideFavoriteTokensTooltip,
  areTokensLoading,
  allTokens,
  account,
  displayLpTokenLists,
  searchInput,
}: TokensContentProps): ReactNode {
  return (
    <>
      {!areTokensLoading && favoriteTokens.length && (
        <>
          <styledEl.Row>
            <FavoriteTokensList
              onSelectToken={onSelectToken}
              selectedToken={(selectedToken && getCurrencyAddress(selectedToken)) || undefined}
              tokens={favoriteTokens}
              hideTooltip={hideFavoriteTokensTooltip}
            />
          </styledEl.Row>
          <styledEl.Separator />
        </>
      )}
      {areTokensLoading ? (
        <styledEl.TokensLoader>
          <Loader />
        </styledEl.TokensLoader>
      ) : (
        <>
          {searchInput ? (
            <TokenSearchResults searchInput={searchInput} {...selectTokenContext} />
          ) : (
            <TokensVirtualList
              allTokens={allTokens}
              {...selectTokenContext}
              account={account}
              displayLpTokenLists={displayLpTokenLists}
            />
          )}
        </>
      )}
      <styledEl.Separator />
      <div>
        <styledEl.ActionButton id="list-token-manage-button" onClick={onOpenManageWidget}>
          <Edit /> <span>Manage Token Lists</span>
        </styledEl.ActionButton>
      </div>
    </>
  )
}
