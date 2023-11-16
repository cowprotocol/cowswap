import { MaxUint256 } from '@ethersproject/constants'
import { Wallet } from '@ethersproject/wallet'
import ms from 'ms.macro'

// PK used only for signing permit requests for quoting and identifying token 'permittability'
// Do not use or try to send funds to it. Or do. It'll be your funds 🤷
const PERMIT_PK = '0xec10458cfaafb32533a4a27e18d9da345758094dde7052521b939a41c55dd1b0' // address: 0x9eF31A6BB1A80e58cb73A906bddFaE308978095C

export const PERMIT_SIGNER = new Wallet(PERMIT_PK)

export const PERMIT_GAS_LIMIT_MIN: Record<number, number> = {
  1: 55_000,
  100: 55_000,
  5: 36_000,
}

export const DEFAULT_PERMIT_GAS_LIMIT = '80000'

export const DEFAULT_PERMIT_VALUE = MaxUint256.toString()

export const DEFAULT_PERMIT_DURATION = ms`5 years`

// DAI's mainnet contract (https://etherscan.io/address/0x6b175474e89094c44da98b954eedeac495271d0f#readContract) returns
// `1` for the version, while when calling the contract method returns `2`.
// Also, if we use the version returned by the contract, it simply doesn't work
// Thus, do not call it for DAI.
// TODO: figure out whether more tokens behave the same way
export const TOKENS_TO_SKIP_VERSION = new Set(['0x6b175474e89094c44da98b954eedeac495271d0f'])
