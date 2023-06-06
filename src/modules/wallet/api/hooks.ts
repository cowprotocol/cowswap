import { useAtomValue } from 'jotai/utils'

import { GnosisSafeInfo, WalletDetails, WalletInfo } from 'modules/wallet'

import { gnosisSafeInfoAtom, walletDetailsAtom, walletDisplayedAddress, walletInfoAtom } from './state'

export function useWalletInfo(): WalletInfo {
  return useAtomValue(walletInfoAtom)
}

export function useWalletDetails(): WalletDetails {
  return useAtomValue(walletDetailsAtom)
}

export function useWalletDisplayedAddress(): string {
  return useAtomValue(walletDisplayedAddress)
}

export function useGnosisSafeInfo(): GnosisSafeInfo | undefined {
  return useAtomValue(gnosisSafeInfoAtom)
}
