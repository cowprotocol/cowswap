import { useMemo } from 'react'

import { t } from '@lingui/core/macro'

import { appendImportSection } from './helpers'
import { TokenSearchRow, UseSearchRowsParams } from './types'

const SEARCH_RESULTS_LIMIT = 100

export function useSearchRows({
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
