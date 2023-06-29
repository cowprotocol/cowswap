import { atom } from 'jotai'

import { shortenAddress } from 'legacy/utils'

import { GnosisSafeInfo, WalletDetails, WalletInfo } from './types'

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
})

export const gnosisSafeInfoAtom = atom<GnosisSafeInfo | undefined>(undefined)

export const walletDisplayedAddress = atom((get) => {
  const { account } = get(walletInfoAtom)
  const { ensName } = get(walletDetailsAtom)

  return ensName || (account ? shortenAddress(account) : '')
})
