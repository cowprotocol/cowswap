import { ReactNode, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { doesTokenMatchSymbolOrAddress } from '@cowprotocol/common-utils'
import { TokenSearchResponse } from '@cowprotocol/tokens'
import { Loader } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import * as styledEl from '../../containers/TokenSearchResults/styled'
import { SelectTokenContext } from '../../types'
import { ImportTokenItem } from '../ImportTokenItem'
import { TokenListItemContainer } from '../TokenListItemContainer'
import { TokenSourceTitle } from '../TokenSourceTitle'

const SEARCH_RESULTS_LIMIT = 100

interface TokenSearchContentProps {
  searchInput: string
  searchResults: TokenSearchResponse
  selectTokenContext: SelectTokenContext
  importToken: (tokenToImport: TokenWithLogo) => void
}

// TODO: Add proper return type annotation
export function TokenSearchContent({
  searchInput,
  searchResults,
  importToken,
  selectTokenContext,
}: TokenSearchContentProps): ReactNode {
  const { inactiveListsResult, blockchainResult, activeListsResult, externalApiResult, isLoading } = searchResults

  const searchCount = [
    activeListsResult.length,
    inactiveListsResult.length,
    blockchainResult.length,
    externalApiResult.length,
  ].reduce<number>((acc, cur) => acc + (cur ?? 0), 0)

  const isTokenNotFound = isLoading ? false : searchCount === 0

  const [matchedTokens, activeList] = useMemo(() => {
    const matched: TokenWithLogo[] = []
    const remaining: TokenWithLogo[] = []

    for (const t of activeListsResult) {
      if (doesTokenMatchSymbolOrAddress(t, searchInput)) {
        // There should ever be only 1 token with a given address
        // There can be multiple with the same symbol
        matched.push(t)
      } else {
        remaining.push(t)
      }
    }

    return [matched, remaining]
  }, [activeListsResult, searchInput])

  return isLoading ? (
    <styledEl.LoaderWrapper>
      <Loader />
    </styledEl.LoaderWrapper>
  ) : isTokenNotFound ? (
    <styledEl.TokenNotFound>
      <Trans>No tokens found</Trans>
    </styledEl.TokenNotFound>
  ) : (
    <>
      {/*Matched tokens first, followed by tokens from active lists*/}
      {matchedTokens.concat(activeList).map((token) => {
        return <TokenListItemContainer key={token.address} token={token} context={selectTokenContext} />
      })}

      {/*Tokens from blockchain*/}
      {blockchainResult?.length ? (
        <styledEl.ImportTokenWrapper id="currency-import">
          {blockchainResult.slice(0, SEARCH_RESULTS_LIMIT).map((token) => {
            return <ImportTokenItem key={token.address} token={token} importToken={importToken} />
          })}
        </styledEl.ImportTokenWrapper>
      ) : null}

      {/*Tokens from inactive lists*/}
      {inactiveListsResult?.length ? (
        <div>
          <TokenSourceTitle
            tooltip={t`Tokens from inactive lists. Import specific tokens below or click Manage to activate more lists.`}
          >
            {t`Expanded results from inactive Token Lists`}
          </TokenSourceTitle>
          <div>
            {inactiveListsResult.slice(0, SEARCH_RESULTS_LIMIT).map((token) => {
              return <ImportTokenItem key={token.address} token={token} importToken={importToken} shadowed />
            })}
          </div>
        </div>
      ) : null}

      {/*Tokens from external sources*/}
      {externalApiResult?.length ? (
        <div>
          <TokenSourceTitle tooltip={t`Tokens from external sources.`}>
            {t`Additional Results from External Sources`}
          </TokenSourceTitle>
          <div>
            {externalApiResult.map((token) => {
              return <ImportTokenItem key={token.address} token={token} importToken={importToken} shadowed />
            })}
          </div>
        </div>
      ) : null}
    </>
  )
}
