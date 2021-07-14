import { AddressMap, MULTICALL2_ADDRESSES as MULTICALL2_ADDRESSES_UNI } from '@src/constants/addresses'
import { SupportedChainId } from 'constants/chains'

export * from '@src/constants/addresses'

export const MULTICALL2_ADDRESSES: AddressMap = {
  ...MULTICALL2_ADDRESSES_UNI,
  [SupportedChainId.XDAI]: '0x08612d3C4A5Dfe2FaaFaFe6a4ff712C2dC675bF7',
}
