import { sendEvent } from '../googleAnalytics'
import { Category } from '../types'

export function changeWalletAnalytics(walletName: string) {
  sendEvent({
    category: Category.WALLET,
    action: 'Change Wallet',
    label: walletName,
  })
}

type AddTokenActions = 'Succeeded' | 'Failed'
export function watchAssetInWalletAnalytics(action: AddTokenActions, symbol: string | undefined) {
  sendEvent({
    category: Category.WALLET,
    action: `Watch asset in wallet ${action}`,
    label: symbol,
  })
}
