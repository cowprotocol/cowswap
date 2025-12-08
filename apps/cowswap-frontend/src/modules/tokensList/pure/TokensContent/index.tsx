import React, { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/types'
import { Loader } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'
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
  searchInput: string
  standalone?: boolean
  areTokensFromBridge: boolean

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
  displayLpTokenLists,
  searchInput,
  standalone,
  areTokensFromBridge,
}: TokensContentProps): ReactNode {
  return (
    <>
      {!areTokensLoading && !!favoriteTokens.length && (
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
            <TokenSearchResults
              searchInput={searchInput}
              selectTokenContext={selectTokenContext}
              areTokensFromBridge={areTokensFromBridge}
              allTokens={allTokens}
            />
          ) : (
            <TokensVirtualList
              selectTokenContext={selectTokenContext}
              allTokens={allTokens}
              displayLpTokenLists={displayLpTokenLists}
            />
          )}
        </>
      )}
      {!standalone && (
        <>
          <styledEl.Separator />
          <div>
            <styledEl.ActionButton id="list-token-manage-button" onClick={onOpenManageWidget}>
              <Edit />{' '}
              <span>
                <Trans>Manage Token Lists</Trans>
              </span>
            </styledEl.ActionButton>
          </div>
        </>
      )}
    </>
  )
}
