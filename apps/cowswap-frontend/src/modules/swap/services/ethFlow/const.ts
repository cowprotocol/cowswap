import { BigNumber } from '@ethersproject/bignumber'

// Use a 150K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
export const ETHFLOW_GAS_LIMIT_DEFAULT = BigNumber.from('150000')
