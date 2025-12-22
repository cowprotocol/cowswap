import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { findRestrictedToken, restrictedTokensAtom } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useGeoStatus } from 'modules/rwa/hooks/useGeoStatus'
import { useRwaConsentModalState } from 'modules/rwa/hooks/useRwaConsentModalState'
import { getConsentFromCache, rwaConsentCacheAtom } from 'modules/rwa/state/rwaConsentAtom'
import { RwaConsentKey } from 'modules/rwa/types/rwaConsent'

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
      const restrictedInfo = findRestrictedToken(tokenToImport, restrictedList)

      if (!restrictedInfo) {
        updateSelectTokenWidget({ tokenToImport })
        return
      }

      if (geoStatus.country) {
        const countryUpper = geoStatus.country.toUpperCase()
        const blockedCountries = new Set(restrictedInfo.restrictedCountries)

        if (blockedCountries.has(countryUpper)) {
          // User is from blocked country - don't allow import
          // TODO: resolve this case
          return
        }

        // Country is known and not blocked - allow import directly
        updateSelectTokenWidget({ tokenToImport })
        return
      }

      // Country unknown - check consent
      const consentKey: RwaConsentKey | null = account ? { wallet: account, ipfsHash: restrictedInfo.tosHash } : null

      if (consentKey) {
        const existingConsent = getConsentFromCache(consentCache, consentKey)
        if (existingConsent?.acceptedAt) {
          // Consent already given - allow import
          updateSelectTokenWidget({ tokenToImport })
          return
        }
      }

      // Consent required - show consent modal first
      // After consent, the modal will trigger the import
      openRwaConsentModal({
        tosHash: restrictedInfo.tosHash,
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
