import { useAtomValue } from 'jotai/utils'
import { GnosisSafeInfo, WalletDetails, WalletInfo } from '@cow/modules/wallet'
import { gnosisSafeInfoAtom, walletDetailsAtom, walletInfoAtom } from './state'

export function useWalletInfo(): WalletInfo {
  return useAtomValue(walletInfoAtom)
}

export function useWalletDetails(): WalletDetails {
  return useAtomValue(walletDetailsAtom)
}

export function useGnosisSafeInfo(): GnosisSafeInfo | undefined {
  return useAtomValue(gnosisSafeInfoAtom)
}
