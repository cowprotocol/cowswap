import { atom } from 'jotai'
import { WalletDetails, WalletInfo } from './types'

export const walletInfoAtom = atom<WalletInfo>({})
export const walletDetailsAtom = atom<WalletDetails>({
  // Account details
  isSmartContractWallet: false,
  ensName: undefined,

  // Provider details
  walletName: undefined,
  icon: undefined,
  isSupportedWallet: false,

  // Feature Support
  allowsOffchainSigning: false,

  // Additioal information
  gnosisSafeInfo: undefined,
})
