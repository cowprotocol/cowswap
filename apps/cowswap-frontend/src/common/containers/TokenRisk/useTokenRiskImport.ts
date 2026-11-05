import { useCallback, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getTokenId } from '@cowprotocol/cow-sdk'
import { TokenWarning, useAcknowledgeTokenWarnings, useTokenWarningsList } from '@cowprotocol/tokens'

export interface TokenRiskImport {
  items: TokenRiskImportItem[]
  /** True while any serious risk is unconfirmed, which keeps Import disabled. */
  isBlocking: boolean
  acknowledge(id: string, isAcknowledged: boolean): void
  /** Records the confirmations. Called once the import actually happens. */
  confirm(): void
}

export interface TokenRiskImportItem {
  id: string
  token: TokenWithLogo
  /** Names the token in the risk copy; the address stands in when it has no symbol. */
  symbol: string
  warnings: TokenWarning[]
  seriousCodes: string[]
  updatedAt: string | undefined
  isAcknowledged: boolean
}

/**
 * Import can be opened with more than one token — a deep link naming an unlisted mint on both
 * sides of the trade — so every token gets its own risks and its own confirmation, and Import
 * waits for all of them.
 */
export function useTokenRiskImport(tokens: readonly TokenWithLogo[]): TokenRiskImport {
  const warningsList = useTokenWarningsList(tokens)
  const acknowledgeWarnings = useAcknowledgeTokenWarnings()
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({})

  const acknowledge = useCallback((id: string, isAcknowledged: boolean): void => {
    setAcknowledged((current) => ({ ...current, [id]: isAcknowledged }))
  }, [])

  const items = tokens.map((token, index) => {
    const id = getTokenId(token)
    const info = warningsList[index]

    return {
      id,
      token,
      symbol: token.symbol ?? token.address,
      warnings: info.warnings,
      seriousCodes: info.seriousWarnings.map((warning) => warning.code),
      updatedAt: info.updatedAt,
      isAcknowledged: !!acknowledged[id],
    }
  })

  const unconfirmed = items.filter((item) => item.seriousCodes.length > 0 && !item.isAcknowledged)

  return {
    items,
    // A token whose check has not come back yet must not look clean, so Import waits for it.
    isBlocking: warningsList.some((info) => info.isLoading) || unconfirmed.length > 0,
    acknowledge,
    confirm: () => {
      for (const item of items) {
        if (item.seriousCodes.length) {
          acknowledgeWarnings(item.token, item.seriousCodes)
        }
      }
    },
  }
}
