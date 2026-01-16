import { useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useAddUserToken } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useCloseTokenSelectWidget, useSelectTokenWidgetState } from 'modules/tokensList'

import { useRwaConsentStatus } from './useRwaConsentStatus'

import { RwaConsentKey } from '../types/rwaConsent'

interface UseImportTokenWithConsentParams {
  consentHash: string | undefined
}

interface UseImportTokenWithConsentResult {
  importWithConsent: (token: TokenWithLogo) => void
}

/**
 * Hook that handles importing a token with consent confirmation.
 * Combines: save consent + import token + select token + close widget
 */
export function useImportTokenWithConsent({
  consentHash,
}: UseImportTokenWithConsentParams): UseImportTokenWithConsentResult {
  const { account } = useWalletInfo()
  const { onSelectToken } = useSelectTokenWidgetState()
  const closeWidget = useCloseTokenSelectWidget()
  const importToken = useAddUserToken()

  const consentKey: RwaConsentKey | null = useMemo(() => {
    if (!account || !consentHash) return null
    return { wallet: account, ipfsHash: consentHash }
  }, [account, consentHash])

  const { confirmConsent } = useRwaConsentStatus(consentKey)

  const importWithConsent = useCallback(
    (token: TokenWithLogo) => {
      if (!account || !consentKey) return

      confirmConsent()
      importToken([token])
      onSelectToken?.(token)
      closeWidget()
    },
    [account, consentKey, confirmConsent, importToken, onSelectToken, closeWidget],
  )

  return useMemo(() => ({ importWithConsent }), [importWithConsent])
}
