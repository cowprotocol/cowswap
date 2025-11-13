import { ReactNode, useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { doesTokenMatchSymbolOrAddress } from '@cowprotocol/common-utils'
import { TokenSearchResponse } from '@cowprotocol/tokens'
import {
  BannerOrientation,
  ExternalLink,
  InlineBanner,
  LINK_GUIDE_ADD_CUSTOM_TOKEN,
  Loader,
  StatusColorVariant,
} from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { VirtualItem } from '@tanstack/react-virtual'

import { VirtualList } from 'common/pure/VirtualList'

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
        matched.push(t)
      } else {
        remaining.push(t)
      }
    }

    return [matched, remaining]
  }, [activeListsResult, searchInput])

  const rows = useSearchRows({
    isLoading,
    matchedTokens,
    activeList,
    blockchainResult,
    inactiveListsResult,
    externalApiResult,
  })

  const renderRow = useCallback(
    (items: TokenSearchRow[], virtualItem: VirtualItem) => (
      <TokenSearchRowRenderer
        row={items[virtualItem.index]}
        selectTokenContext={selectTokenContext}
        importToken={importToken}
      />
    ),
    [importToken, selectTokenContext],
  )

  if (isLoading)
    return (
      <styledEl.LoaderWrapper>
        <Loader />
      </styledEl.LoaderWrapper>
    )

  if (isTokenNotFound)
    return (
      <styledEl.TokenNotFound>
        <Trans>No tokens found</Trans>
      </styledEl.TokenNotFound>
    )

  return <VirtualList id="token-search-results" items={rows} getItemView={renderRow} scrollResetKey={searchInput} />
}

type TokenImportSection = 'blockchain' | 'inactive' | 'external'

type TokenSearchRow =
  | { type: 'banner' }
  | { type: 'token'; token: TokenWithLogo }
  | { type: 'section-title'; text: string; tooltip?: string }
  | {
      type: 'import-token'
      token: TokenWithLogo
      shadowed?: boolean
      section: TokenImportSection
      isFirstInSection: boolean
      isLastInSection: boolean
      wrapperId?: string
    }

interface UseSearchRowsParams {
  isLoading: boolean
  matchedTokens: TokenWithLogo[]
  activeList: TokenWithLogo[]
  blockchainResult?: TokenWithLogo[]
  inactiveListsResult?: TokenWithLogo[]
  externalApiResult?: TokenWithLogo[]
}

function useSearchRows({
  isLoading,
  matchedTokens,
  activeList,
  blockchainResult,
  inactiveListsResult,
  externalApiResult,
}: UseSearchRowsParams): TokenSearchRow[] {
  return useMemo(() => {
    const entries: TokenSearchRow[] = []

    if (isLoading) {
      return entries
    }

    entries.push({ type: 'banner' })

    for (const token of matchedTokens) {
      entries.push({ type: 'token', token })
    }

    for (const token of activeList) {
      entries.push({ type: 'token', token })
    }

    appendImportSection(entries, {
      tokens: blockchainResult,
      section: 'blockchain',
      limit: SEARCH_RESULTS_LIMIT,
      sectionTitle: undefined,
      tooltip: undefined,
      shadowed: false,
      wrapperId: 'currency-import',
    })

    appendImportSection(entries, {
      tokens: inactiveListsResult,
      section: 'inactive',
      limit: SEARCH_RESULTS_LIMIT,
      sectionTitle: t`Expanded results from inactive Token Lists`,
      tooltip: t`Tokens from inactive lists. Import specific tokens below or click Manage to activate more lists.`,
      shadowed: true,
    })

    appendImportSection(entries, {
      tokens: externalApiResult,
      section: 'external',
      limit: SEARCH_RESULTS_LIMIT,
      sectionTitle: t`Additional Results from External Sources`,
      tooltip: t`Tokens from external sources.`,
      shadowed: true,
    })

    return entries
  }, [isLoading, matchedTokens, activeList, blockchainResult, inactiveListsResult, externalApiResult])
}

interface AppendImportSectionParams {
  tokens?: TokenWithLogo[]
  section: TokenImportSection
  limit: number
  sectionTitle?: string
  tooltip?: string
  shadowed?: boolean
  wrapperId?: string
}

function appendImportSection(rows: TokenSearchRow[], params: AppendImportSectionParams): void {
  const { tokens, section, limit, sectionTitle, tooltip, shadowed, wrapperId } = params

  if (!tokens?.length) {
    return
  }

  if (sectionTitle) {
    rows.push({ type: 'section-title', text: sectionTitle, tooltip })
  }

  const limitedTokens = tokens.slice(0, limit)

  limitedTokens.forEach((token, index) => {
    rows.push({
      type: 'import-token',
      token,
      section,
      shadowed,
      isFirstInSection: index === 0,
      isLastInSection: index === limitedTokens.length - 1,
      wrapperId: index === 0 ? wrapperId : undefined,
    })
  })
}

interface TokenSearchRowRendererProps {
  row: TokenSearchRow
  selectTokenContext: SelectTokenContext
  importToken(token: TokenWithLogo): void
}

function TokenSearchRowRenderer({ row, selectTokenContext, importToken }: TokenSearchRowRendererProps): ReactNode {
  switch (row.type) {
    case 'banner':
      return <GuideBanner />
    case 'token':
      return <TokenListItemContainer token={row.token} context={selectTokenContext} />
    case 'section-title': {
      const tooltip = row.tooltip ?? ''
      return (
        <styledEl.SectionTitleRow>
          <TokenSourceTitle tooltip={tooltip}>{row.text}</TokenSourceTitle>
        </styledEl.SectionTitleRow>
      )
    }
    case 'import-token':
      return (
        <ImportTokenItem
          token={row.token}
          importToken={importToken}
          shadowed={row.shadowed}
          wrapperId={row.wrapperId}
          isFirstInSection={row.isFirstInSection}
          isLastInSection={row.isLastInSection}
        />
      )
    default:
      return null
  }
}

function GuideBanner(): ReactNode {
  return (
    <InlineBanner
      margin="10px"
      width="auto"
      orientation={BannerOrientation.Horizontal}
      bannerType={StatusColorVariant.Info}
    >
      <p>
        <Trans>
          Can't find your token on the list? <ExternalLink href={LINK_GUIDE_ADD_CUSTOM_TOKEN}>Read our guide</ExternalLink>{' '}
          on how to add custom tokens.
        </Trans>
      </p>
    </InlineBanner>
  )
}
