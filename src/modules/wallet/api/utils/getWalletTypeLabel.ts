import { WalletType } from '../types'

const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  [WalletType.SAFE]: 'Safe',
  [WalletType.SC]: 'smart contract wallet',
  [WalletType.EOA]: 'wallet',
}

export function getWalletTypeLabel(walletType: WalletType): string {
  return WALLET_TYPE_LABELS[walletType]
}
