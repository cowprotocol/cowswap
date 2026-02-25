import { useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { t } from '@lingui/core/macro'

import { CustomFlowContext, CustomFlowResult, TokenSelectorView, ViewFlowConfig } from 'modules/tokensList'

import { useImportTokenRwaCheck } from './useImportTokenRwaCheck'
import { useImportTokenWithConsent } from './useImportTokenWithConsent'

import { RwaConsentModal } from '../pure/RwaConsentModal'

function getRestrictedFlowResult(): CustomFlowResult<TokenSelectorView.ImportToken> {
  return {
    content: null,
    data: {
      restriction: {
        isBlocked: true,
        message: t`This token is not available in your region.`,
      },
    },
  }
}

/**
 * Hook that provides preFlow for ImportToken view.
 * Handles consent modal and restriction data for RWA tokens.
 */
export function useImportTokenConsentFlow(): ViewFlowConfig<TokenSelectorView.ImportToken> | null {
  const { tokenToImport, rwaStatus, rwaTokenInfo } = useImportTokenRwaCheck()
  const { importWithConsent } = useImportTokenWithConsent({ consentHash: rwaTokenInfo?.consentHash })

  const preFlow = useCallback(
    (context: CustomFlowContext): CustomFlowResult<TokenSelectorView.ImportToken> | null => {
      if (!tokenToImport) return null

      if (rwaStatus === 'restricted') {
        return getRestrictedFlowResult()
      }

      if (rwaStatus === 'requires-consent' && rwaTokenInfo) {
        const displayToken = TokenWithLogo.fromToken(tokenToImport)
        return {
          content: (
            <RwaConsentModal
              onDismiss={context.onCancel}
              onConfirm={() => importWithConsent(tokenToImport)}
              token={displayToken}
              consentHash={rwaTokenInfo.consentHash}
            />
          ),
        }
      }

      return null
    },
    [tokenToImport, rwaStatus, rwaTokenInfo, importWithConsent],
  )

  return useMemo(() => {
    if (!tokenToImport) return null
    return { preFlow }
  }, [tokenToImport, preFlow])
}
