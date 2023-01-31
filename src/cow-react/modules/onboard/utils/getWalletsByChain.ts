import { WalletOptions } from '../constants/wallets'
import { isDisabledWallet } from './isDisabledWallet'
import { CONNECT_OPTIONS } from '../constants/wallets'
import { SupportedChainId } from 'constants/chains'

export const getWalletsByChain = (chainId: SupportedChainId = SupportedChainId.MAINNET) => {
  return Object.entries(CONNECT_OPTIONS)
    .filter(([wallet]) => isDisabledWallet(wallet as WalletOptions, chainId))
    .map(([, option]) => option())
}
