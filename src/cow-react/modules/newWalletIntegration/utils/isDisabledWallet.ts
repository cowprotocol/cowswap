import { WalletOptions, DISABLED_WALLETS_BY_CHAIN } from '../constants/wallets'
import { SupportedChainId } from 'constants/chains'

export const isDisabledWallet = (wallet: WalletOptions, chainId: SupportedChainId) => {
  return !DISABLED_WALLETS_BY_CHAIN[chainId].includes(wallet)
}
