import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { t } from '@lingui/core/macro'

import { RwaTokenInfo, RwaTokenStatus, useRwaTokenStatus } from 'modules/rwa'

import { ImportRestriction } from '../pure/ImportTokenModal'

export interface RestrictedTokensImportResult {
  isImportDisabled: boolean
  blockReason: string | null
  /** Ready to hand to `ImportTokenModal`, so callers do not rebuild it from the two fields above */
  restriction: ImportRestriction | null
  restrictedTokenInfo: RwaTokenInfo | null
  /** When true, consent modal should be shown before import */
  requiresConsent: boolean
  /** The first restricted token that needs consent */
  tokenNeedingConsent: TokenWithLogo | null
}

const NOT_RESTRICTED_RESULT: RestrictedTokensImportResult = {
  isImportDisabled: false,
  blockReason: null,
  restriction: null,
  restrictedTokenInfo: null,
  requiresConsent: false,
  tokenNeedingConsent: null,
}

/**
 * Check if any of the tokens are restricted for the user's country (for auto-import flow)
 * Reuses useRwaTokenStatus for consistent restriction logic
 */
export function useRestrictedTokensImportStatus(tokens: TokenWithLogo[]): RestrictedTokensImportResult {
  const inputToken = tokens[0]
  const outputToken = tokens[1]

  const { status, rwaTokenInfo } = useRwaTokenStatus({
    inputCurrency: inputToken,
    outputCurrency: outputToken,
  })

  return useMemo(() => {
    if (tokens.length === 0) {
      return NOT_RESTRICTED_RESULT
    }

    switch (status) {
      case RwaTokenStatus.Restricted: {
        const blockReason = t`This token is not available in your region.`

        return {
          isImportDisabled: true,
          blockReason,
          restriction: { isBlocked: true, message: blockReason },
          restrictedTokenInfo: rwaTokenInfo,
          requiresConsent: false,
          tokenNeedingConsent: null,
        }
      }

      case RwaTokenStatus.RequiredConsent:
        return {
          isImportDisabled: false,
          blockReason: null,
          restriction: null,
          restrictedTokenInfo: rwaTokenInfo,
          requiresConsent: true,
          tokenNeedingConsent: rwaTokenInfo?.token ? TokenWithLogo.fromToken(rwaTokenInfo.token) : null,
        }

      case RwaTokenStatus.Allowed:
      case RwaTokenStatus.ConsentIsSigned:
      default:
        return NOT_RESTRICTED_RESULT
    }
  }, [tokens.length, status, rwaTokenInfo])
}
