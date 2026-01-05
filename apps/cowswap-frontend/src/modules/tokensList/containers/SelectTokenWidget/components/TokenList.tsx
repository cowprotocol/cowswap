import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import * as styledEl from '../../../pure/SelectTokenModal/styled'
import { TokensContent } from '../../../pure/TokensContent'
import { LpTokenListsWidget } from '../../LpTokenListsWidget'
import { useTokenListContext, useSearchContext } from '../SelectTokenWidgetContext'

/**
 * SelectTokenWidget.TokenList - The main token list with favorites, recents, and all tokens.
 * Reads its data from TokenListContext.
 */
export function TokenList(): ReactNode {
  const {
    displayLpTokenLists,
    tokenListCategoryState,
    disableErc20,
    isRouteAvailable,
    account,
    onSelectToken,
    openPoolPage,
  } = useTokenListContext()
  const { value: searchInput } = useSearchContext()

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
