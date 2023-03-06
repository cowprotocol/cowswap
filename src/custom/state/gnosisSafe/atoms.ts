import { SafeInfoResponse } from '@safe-global/safe-service-client'
import { atom } from 'jotai'

export const gnosisSafeAtom = atom<SafeInfoResponse | undefined>(undefined)
