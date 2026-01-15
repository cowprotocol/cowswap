import { useCallback, useMemo } from 'react'

import { useToggleList } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import {
  CustomFlowResult,
  TokenSelectorView,
  useSelectTokenWidgetState,
  useUpdateSelectTokenWidgetState,
  ViewFlowConfig,
} from 'modules/tokensList'

import { useRwaConsentStatus } from './useRwaConsentStatus'

import { RwaConsentModal } from '../pure/RwaConsentModal'
import { RwaConsentKey } from '../types/rwaConsent'

/**
 * Hook that provides postFlow for Manage view.
 * Shows consent modal when user tries to toggle on a restricted list.
 */
export function useListToggleConsentFlow(): ViewFlowConfig<TokenSelectorView.Manage> | null {
  const { account } = useWalletInfo()
  const { listToToggle } = useSelectTokenWidgetState()
  const updateWidgetState = useUpdateSelectTokenWidgetState()
  const toggleList = useToggleList(() => {})

  const consentKey: RwaConsentKey | null = useMemo(() => {
    if (!account || !listToToggle) return null
    return { wallet: account, ipfsHash: listToToggle.consentHash }
  }, [account, listToToggle])

  const { confirmConsent } = useRwaConsentStatus(consentKey)

  const postFlow = useCallback((): CustomFlowResult<TokenSelectorView.Manage> | null => {
    if (!listToToggle) return null

    const clearPendingState = (): void => {
      updateWidgetState({ listToToggle: undefined })
    }

    const handleDismiss = (): void => {
      // don't toggle, just clear the pending state
      clearPendingState()
    }

    const handleConfirm = (): void => {
      if (!account || !consentKey) {
        clearPendingState()
        return
      }
      confirmConsent()
      toggleList(listToToggle.list, true)
      clearPendingState()
    }

    return {
      content: (
        <RwaConsentModal
          onDismiss={handleDismiss}
          onConfirm={handleConfirm}
          listName={listToToggle.list.list.name}
          consentHash={listToToggle.consentHash}
        />
      ),
    }
  }, [listToToggle, account, consentKey, confirmConsent, toggleList, updateWidgetState])

  return useMemo(() => {
    if (!listToToggle) return null
    return { postFlow }
  }, [listToToggle, postFlow])
}
