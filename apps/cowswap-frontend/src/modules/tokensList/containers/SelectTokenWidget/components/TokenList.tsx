import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import * as styledEl from '../../../pure/SelectTokenModal/styled'
import { TokensContent } from '../../../pure/TokensContent'
import { LpTokenListsWidget } from '../../LpTokenListsWidget'
import { useTokenListState } from '../hooks'

/**
 * SelectTokenWidget.TokenList - The main token list with favorites, recents, and all tokens.
 * Uses useTokenListState hook that combines atoms + context.
 */
export function TokenList(): ReactNode {
  const {
    displayLpTokenLists,
    tokenListCategoryState,
    disableErc20,
    isRouteAvailable,
    account,
    searchInput,
    onSelectToken,
    openPoolPage,
  } = useTokenListState()

  if (displayLpTokenLists) {
    return (
      <LpTokenListsWidget
        account={account}
        search={searchInput}
        onSelectToken={onSelectToken}
        openPoolPage={openPoolPage}
        disableErc20={disableErc20}
        tokenListCategoryState={tokenListCategoryState}
      >
        <TokensContent />
      </LpTokenListsWidget>
    )
  }

  return (
    <>
      {isRouteAvailable === false ? (
        <styledEl.RouteNotAvailable>
          <Trans>This route is not yet supported.</Trans>
        </styledEl.RouteNotAvailable>
      ) : (
        <TokensContent />
      )}
    </>
  )
}
