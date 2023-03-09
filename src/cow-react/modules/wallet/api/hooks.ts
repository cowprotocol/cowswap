import { useAtomValue } from 'jotai/utils'
import { WalletDetails, WalletInfo } from '@cow/modules/wallet'
import { walletDetailsAtom, walletInfoAtom } from './state'

export function useWalletInfo(): WalletInfo {
  return useAtomValue(walletInfoAtom)
}

export function useWalletDetails(): WalletDetails {
  return useAtomValue(walletDetailsAtom)
}
