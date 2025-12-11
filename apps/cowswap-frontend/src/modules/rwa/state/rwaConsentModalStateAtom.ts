import { atom } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

export interface RwaConsentModalState {
  isModalOpen: boolean
  context?: {
    issuer: string
    tosVersion: string
    issuerName?: string
    token?: TokenWithLogo
  }
}

const initialRwaConsentModalState: RwaConsentModalState = {
  isModalOpen: false,
  context: undefined,
}

export const {
  atom: rwaConsentModalStateAtom,
  updateAtom: updateRwaConsentModalStateAtom,
} = atomWithPartialUpdate(atom<RwaConsentModalState>(initialRwaConsentModalState))

