import { ReactNode, useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useAddUserToken } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import {
  CustomFlowContext,
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
 * When a user tries to import a restricted token and their country is unknown,
 * this shows the consent modal before proceeding to the import.
 *
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

  // create the pre-flow for ImportToken
  const importTokenPreFlow = useCallback(
    (context: CustomFlowContext): ReactNode => {
      // only show consent if required
      if (rwaStatus !== RwaTokenStatus.RequiredConsent || !rwaTokenInfo || !tokenToImport) {
        return null
      }

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

      return <RwaConsentModal onDismiss={handleDismiss} onConfirm={handleConfirm} token={displayToken} />
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
