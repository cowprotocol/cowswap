import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getCurrentChainIdFromUrl, shortenAddress } from '@cowprotocol/common-utils'

import { GnosisSafeInfo, WalletDetails, WalletInfo } from './types'

export const walletInfoAtom = atom<WalletInfo>({ chainId: getCurrentChainIdFromUrl() })

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
  isSafeApp: false,
})

export const gnosisSafeInfoAtom = atom<GnosisSafeInfo | undefined>(undefined)

export const walletDisplayedAddress = atom((get) => {
  const { account } = get(walletInfoAtom)
  const { ensName } = get(walletDetailsAtom)

  return ensName || (account ? shortenAddress(account) : '')
})

export const hwAccountIndexAtom = atomWithStorage<number>('hw-account-index:v1', 0)
