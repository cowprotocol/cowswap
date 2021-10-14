import { AddressMap, MULTICALL_ADDRESS as MULTICALL2_ADDRESSES_UNI } from '@src/constants/addresses'
import { SupportedChainId } from 'constants/chains'

export * from '@src/constants/addresses'

export const MULTICALL_ADDRESS: AddressMap = {
  ...MULTICALL2_ADDRESSES_UNI,
  [SupportedChainId.XDAI]: '0x0f41c16b8ad27c11f181eca85f0941868c1297af',
}
