// this file essentially provides all the overrides employed in uniswap-xdai-sdk fork
// + logic for chainId switch to/from xDAI
import { SupportedChainId as ChainId } from 'constants/chains'
import { GpEther as ETHER } from 'constants/tokens'
import { XDAI_SYMBOL } from './constants'

const CURRENCY_SYMBOLS_XDAI = { native: XDAI_SYMBOL, wrapped: 'wxDAI' }
const CURRENCY_SYMBOLS_ETH = { native: 'Ether', wrapped: 'WETH' }

export function getChainCurrencySymbols(chainId?: ChainId): { native: string; wrapped: string } {
  if (!chainId) return CURRENCY_SYMBOLS_ETH
  return ETHER.onChain(chainId).symbol === XDAI_SYMBOL ? CURRENCY_SYMBOLS_XDAI : CURRENCY_SYMBOLS_ETH
}
