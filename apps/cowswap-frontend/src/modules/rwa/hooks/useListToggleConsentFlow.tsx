import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { CustomFlowResult, pendingListToggleConsentAtom, TokenSelectorView, ViewFlowConfig } from 'modules/tokensList'

import { useRwaConsentStatus } from './useRwaConsentStatus'

import { RwaConsentModal } from '../pure/RwaConsentModal'
import { RwaConsentKey } from '../types/rwaConsent'

/**
 * Hook that provides postFlow for Manage view.
 * Shows consent modal when user tries to toggle on a restricted list.
 */
export function useListToggleConsentFlow(): ViewFlowConfig<TokenSelectorView.Manage> | null {
  const { account } = useWalletInfo()
  const pendingListConsent = useAtomValue(pendingListToggleConsentAtom)

  const consentKey: RwaConsentKey | null = useMemo(() => {
    if (!account || !pendingListConsent) return null
    return { wallet: account, ipfsHash: pendingListConsent.consentHash }
  }, [account, pendingListConsent])

  const { confirmConsent } = useRwaConsentStatus(consentKey)

  const postFlow = useCallback((): CustomFlowResult<TokenSelectorView.Manage> | null => {
    if (!pendingListConsent) return null

    const handleDismiss = (): void => {
      pendingListConsent.onCancel()
    }

    const handleConfirm = (): void => {
      if (!account || !consentKey) return
      confirmConsent()
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
  }, [pendingListConsent, account, consentKey, confirmConsent])

  // Only return config if there's a pending consent
  if (!pendingListConsent) return null

  return { postFlow }
}
