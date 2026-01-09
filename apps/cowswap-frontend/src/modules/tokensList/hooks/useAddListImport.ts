import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { getSourceAsKey, ListState, restrictedListsAtom } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import {
  getConsentFromCache,
  rwaConsentCacheAtom,
  RwaConsentKey,
  useGeoStatus,
  useRwaConsentModalState,
} from 'modules/rwa'

import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

export function useAddListImport(): (listToImport: ListState) => void {
  const { account } = useWalletInfo()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const { openModal: openRwaConsentModal } = useRwaConsentModalState()
  const restrictedLists = useAtomValue(restrictedListsAtom)
  const consentCache = useAtomValue(rwaConsentCacheAtom)
  const geoStatus = useGeoStatus()

  return useCallback(
    (listToImport: ListState) => {
      // If restricted lists not loaded or geo is loading, just proceed
      if (!restrictedLists.isLoaded || geoStatus.isLoading) {
        updateSelectTokenWidget({ listToImport })
        return
      }

      const sourceKey = getSourceAsKey(listToImport.source)
      const consentHash = restrictedLists.consentHashPerList[sourceKey]

      // If list is not in restricted lists, proceed normally
      if (!consentHash) {
        updateSelectTokenWidget({ listToImport })
        return
      }

      // If country is known, allow import (blocked check happens in import modal)
      if (geoStatus.country) {
        updateSelectTokenWidget({ listToImport })
        return
      }

      // Country unknown - if no wallet, allow import (consent check deferred to trade time)
      if (!account) {
        updateSelectTokenWidget({ listToImport })
        return
      }

      // Wallet connected - check if consent already given
      const consentKey: RwaConsentKey = { wallet: account, ipfsHash: consentHash }
      const existingConsent = getConsentFromCache(consentCache, consentKey)
      if (existingConsent?.acceptedAt) {
        updateSelectTokenWidget({ listToImport })
        return
      }

      // Wallet connected but no consent - open modal
      openRwaConsentModal({
        consentHash,
        onImportSuccess: () => {
          updateSelectTokenWidget({ listToImport })
        },
      })
    },
    [account, updateSelectTokenWidget, openRwaConsentModal, restrictedLists, consentCache, geoStatus],
  )
}
