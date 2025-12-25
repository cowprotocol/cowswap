import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { findRestrictedToken, restrictedTokensAtom } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import {
  getConsentFromCache,
  rwaConsentCacheAtom,
  RwaConsentKey,
  useGeoStatus,
  useRwaConsentModalState,
} from 'modules/rwa'

import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

export function useAddTokenImportCallback(): (tokenToImport: TokenWithLogo) => void {
  const { account } = useWalletInfo()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const { openModal: openRwaConsentModal } = useRwaConsentModalState()
  const restrictedList = useAtomValue(restrictedTokensAtom)
  const consentCache = useAtomValue(rwaConsentCacheAtom)
  const geoStatus = useGeoStatus()

  return useCallback(
    (tokenToImport: TokenWithLogo) => {
      if (!restrictedList.isLoaded || geoStatus.isLoading) {
        updateSelectTokenWidget({ tokenToImport })
        return
      }

      const restrictedInfo = findRestrictedToken(tokenToImport, restrictedList)

      if (!restrictedInfo) {
        updateSelectTokenWidget({ tokenToImport })
        return
      }

      // if country is known, allow import (blocked check happens in import modal)
      if (geoStatus.country) {
        updateSelectTokenWidget({ tokenToImport })
        return
      }

      // country unknown- need consent before import
      if (account) {
        const consentKey: RwaConsentKey = { wallet: account, ipfsHash: restrictedInfo.consentHash }
        const existingConsent = getConsentFromCache(consentCache, consentKey)
        if (existingConsent?.acceptedAt) {
          updateSelectTokenWidget({ tokenToImport })
          return
        }
      }

      openRwaConsentModal({
        consentHash: restrictedInfo.consentHash,
        token: tokenToImport,
        pendingImportTokens: [tokenToImport],
        onImportSuccess: () => {
          updateSelectTokenWidget({ tokenToImport })
        },
      })
    },
    [account, updateSelectTokenWidget, openRwaConsentModal, restrictedList, consentCache, geoStatus],
  )
}
