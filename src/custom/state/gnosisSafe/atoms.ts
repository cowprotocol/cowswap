import { SafeInfoResponse } from '@gnosis.pm/safe-service-client'
import { atom } from 'jotai'

export const gnosisSafeAtom = atom<SafeInfoResponse | undefined>(undefined)
