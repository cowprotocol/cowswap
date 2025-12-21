import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { findRestrictedToken, restrictedTokensAtom } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useRwaConsentModalState } from 'modules/rwa/hooks/useRwaConsentModalState'
import { getConsentFromCache, rwaConsentCacheAtom } from 'modules/rwa/state/rwaConsentAtom'
import { RwaConsentKey } from 'modules/rwa/types/rwaConsent'

interface ImportWithConsentCallbacks {
  onImport: (tokens: TokenWithLogo[]) => void
  onSelectAndClose: (token: TokenWithLogo) => void
}

interface UseImportTokenWithConsentResult {
  importTokenWithConsent: (tokens: TokenWithLogo[], callbacks: ImportWithConsentCallbacks) => void
}

export function useImportTokenWithConsent(): UseImportTokenWithConsentResult {
  const { account } = useWalletInfo()
  const { openModal: openRwaConsentModal } = useRwaConsentModalState()
  const restrictedList = useAtomValue(restrictedTokensAtom)
  const consentCache = useAtomValue(rwaConsentCacheAtom)

  const importTokenWithConsent = useCallback(
    (tokens: TokenWithLogo[], callbacks: ImportWithConsentCallbacks) => {
      const { onImport, onSelectAndClose } = callbacks
      const token = tokens[0]

      if (!token) {
        onImport(tokens)
        return
      }

      const restrictedInfo = findRestrictedToken(token, restrictedList)

      if (!restrictedInfo) {
        onImport(tokens)
        return
      }

      const consentKey: RwaConsentKey | null = account ? { wallet: account, ipfsHash: restrictedInfo.tosHash } : null

      if (!consentKey) {
        onImport(tokens)
        return
      }

      const existingConsent = getConsentFromCache(consentCache, consentKey)
      if (existingConsent?.acceptedAt) {
        onImport(tokens)
        return
      }

      openRwaConsentModal({
        tosHash: restrictedInfo.tosHash,
        token,
        pendingImportTokens: tokens,
        onImportSuccess: () => onSelectAndClose(token),
      })
    },
    [account, openRwaConsentModal, restrictedList, consentCache],
  )

  return { importTokenWithConsent }
}
