import { Category, reportEvent } from './index'

export function changeWalletAnalytics(walletName: string) {
  reportEvent({
    category: Category.WALLET,
    action: 'Change Wallet',
    label: walletName,
  })
}
