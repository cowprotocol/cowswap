import { atom } from 'jotai'

export interface WalletConnectionState {
  connectionError?: string
}

export const walletConnectionAtom = atom<WalletConnectionState>({})
