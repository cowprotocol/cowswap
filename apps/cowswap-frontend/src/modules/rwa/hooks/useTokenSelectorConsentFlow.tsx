import { useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useAddUserToken } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'

import {
  CustomFlowContext,
  CustomFlowResult,
  CustomFlowsRegistry,
  TokenSelectorView,
  useCloseTokenSelectWidget,
  useSelectTokenWidgetState,
} from 'modules/tokensList'

import { useRwaConsentStatus } from './useRwaConsentStatus'
import { useRwaTokenStatus, RwaTokenStatus } from './useRwaTokenStatus'

import { RwaConsentModal } from '../pure/RwaConsentModal'
import { RwaConsentKey } from '../types/rwaConsent'

/**
 * Hook that provides custom flows for the token selector with RWA consent support.
 *
 * Handles two cases:
 * - RequiredConsent: shows consent modal before import (pre-flow with content)
 * - Restricted: shows import modal with disabled button and alert (pre-flow with data)
 */
export function useTokenSelectorConsentFlow(): CustomFlowsRegistry {
  const { account } = useWalletInfo()
  const widgetState = useSelectTokenWidgetState()
  const closeWidget = useCloseTokenSelectWidget()
  const importTokenCallback = useAddUserToken()

  const tokenToImport = widgetState.tokenToImport
  const onSelectToken = widgetState.onSelectToken

  // check RWA status for the token being imported
  const { status: rwaStatus, rwaTokenInfo } = useRwaTokenStatus({
    inputCurrency: tokenToImport,
    outputCurrency: undefined,
  })

  const consentKey: RwaConsentKey | null = useMemo(() => {
    if (!account || !rwaTokenInfo) return null
    return {
      wallet: account,
      ipfsHash: rwaTokenInfo.consentHash,
    }
  }, [account, rwaTokenInfo])

  const { confirmConsent } = useRwaConsentStatus(consentKey)

  // pre-flow for ImportToken - handles both consent modal and restriction
  const importTokenPreFlow = useCallback(
    (context: CustomFlowContext): CustomFlowResult<TokenSelectorView.ImportToken> | null => {
      // token is restricted - pass restriction data to the modal
      if (rwaStatus === RwaTokenStatus.Restricted && tokenToImport) {
        return {
          content: null, // show the base view
          data: {
            restriction: {
              isBlocked: true,
              message: t`This token is not available in your region.`,
            },
          },
        }
      }

      // consent required - show consent modal
      if (rwaStatus === RwaTokenStatus.RequiredConsent && rwaTokenInfo && tokenToImport) {
        const handleDismiss = (): void => {
          context.onCancel()
        }

        const handleConfirm = (): void => {
          if (!account || !consentKey) return

          // save consent
          confirmConsent()

          // import the token and select it
          importTokenCallback([tokenToImport])

          if (onSelectToken) {
            onSelectToken(tokenToImport)
          }

          closeWidget()
        }

        const displayToken = TokenWithLogo.fromToken(tokenToImport)

        return {
          content: (
            <RwaConsentModal
              onDismiss={handleDismiss}
              onConfirm={handleConfirm}
              token={displayToken}
              consentHash={rwaTokenInfo.consentHash}
            />
          ),
        }
      }

      // no flow needed
      return null
    },
    [
      rwaStatus,
      rwaTokenInfo,
      tokenToImport,
      account,
      consentKey,
      confirmConsent,
      importTokenCallback,
      onSelectToken,
      closeWidget,
    ],
  )

  return useMemo(
    (): CustomFlowsRegistry => ({
      [TokenSelectorView.ImportToken]: {
        preFlow: importTokenPreFlow,
      },
    }),
    [importTokenPreFlow],
  )
}
