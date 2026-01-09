import { atom } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

export interface RwaConsentModalContext {
  consentHash: string
  token?: TokenWithLogo
  pendingImportTokens?: TokenWithLogo[]
  onImportSuccess?: () => void
  onDismiss?: () => void
}

export interface RwaConsentModalState {
  isModalOpen: boolean
  context?: RwaConsentModalContext
}

const initialRwaConsentModalState: RwaConsentModalState = {
  isModalOpen: false,
  context: undefined,
}

export const { atom: rwaConsentModalStateAtom, updateAtom: updateRwaConsentModalStateAtom } = atomWithPartialUpdate(
  atom<RwaConsentModalState>(initialRwaConsentModalState),
)
