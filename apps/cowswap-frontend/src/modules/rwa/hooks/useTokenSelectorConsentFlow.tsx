import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useAddUserToken } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'

import {
  CustomFlowContext,
  CustomFlowResult,
  CustomFlowsRegistry,
  pendingListToggleConsentAtom,
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
 * Handles:
 * - ImportToken preFlow: consent modal or restriction data
 * - Manage postFlow: consent modal for list toggle
 */
// eslint-disable-next-line max-lines-per-function
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

  // pending list toggle consent (set by useConsentAwareToggleList)
  const pendingListConsent = useAtomValue(pendingListToggleConsentAtom)

  const tokenConsentKey: RwaConsentKey | null = useMemo(() => {
    if (!account || !rwaTokenInfo) return null
    return { wallet: account, ipfsHash: rwaTokenInfo.consentHash }
  }, [account, rwaTokenInfo])

  const listConsentKey: RwaConsentKey | null = useMemo(() => {
    if (!account || !pendingListConsent) return null
    return { wallet: account, ipfsHash: pendingListConsent.consentHash }
  }, [account, pendingListConsent])

  const { confirmConsent: confirmTokenConsent } = useRwaConsentStatus(tokenConsentKey)
  const { confirmConsent: confirmListConsent } = useRwaConsentStatus(listConsentKey)

  // pre-flow for ImportToken - handles both consent modal and restriction
  const importTokenPreFlow = useCallback(
    (context: CustomFlowContext): CustomFlowResult<TokenSelectorView.ImportToken> | null => {
      if (rwaStatus === RwaTokenStatus.Restricted && tokenToImport) {
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

      if (rwaStatus === RwaTokenStatus.RequiredConsent && rwaTokenInfo && tokenToImport) {
        const handleDismiss = (): void => context.onCancel()
        const handleConfirm = (): void => {
          if (!account || !tokenConsentKey) return
          confirmTokenConsent()
          importTokenCallback([tokenToImport])
          if (onSelectToken) onSelectToken(tokenToImport)
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

      return null
    },
    [
      rwaStatus,
      rwaTokenInfo,
      tokenToImport,
      account,
      tokenConsentKey,
      confirmTokenConsent,
      importTokenCallback,
      onSelectToken,
      closeWidget,
    ],
  )

  // post-flow for Manage view - shows consent modal for list toggle
  const managePostFlow = useCallback((): CustomFlowResult<TokenSelectorView.Manage> | null => {
    if (!pendingListConsent) return null

    const handleDismiss = (): void => {
      pendingListConsent.onCancel()
    }

    const handleConfirm = (): void => {
      if (!account || !listConsentKey) return
      confirmListConsent()
      pendingListConsent.onConfirm()
    }

    return {
      content: (
        <RwaConsentModal
          onDismiss={handleDismiss}
          onConfirm={handleConfirm}
          listName={pendingListConsent.list.list.name}
          consentHash={pendingListConsent.consentHash}
        />
      ),
    }
  }, [pendingListConsent, account, listConsentKey, confirmListConsent])

  return useMemo(
    (): CustomFlowsRegistry => ({
      [TokenSelectorView.ImportToken]: {
        preFlow: importTokenPreFlow,
      },
      [TokenSelectorView.Manage]: {
        postFlow: managePostFlow,
      },
    }),
    [importTokenPreFlow, managePostFlow],
  )
}
