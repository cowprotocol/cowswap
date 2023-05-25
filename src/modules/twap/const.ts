import { SupportedChainId } from '@cowprotocol/cow-sdk'

export const TWAP_ORDER_STRUCT =
  'tuple(address sellToken,address buyToken,address receiver,uint256 partSellAmount,uint256 minPartLimit,uint256 t0,uint256 n,uint256 t,uint256 span)'

export const TWAP_HANDLER_ADDRESS: Record<SupportedChainId, string> = {
  1: 'TODO',
  100: 'TODO',
  5: '0xa12d770028d7072b80baeb6a1df962374fd13d9a',
}
