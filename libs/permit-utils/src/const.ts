import ms from 'ms.macro'
import { maxUint256 } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

// PK used only for signing permit requests for quoting and identifying token 'permittability'
// Do not use or try to send funds to it. Or do. It'll be your funds 🤷
const PERMIT_PK = '0xa50dc0f7fc051309434deb3b1c71e927dbb711759231d8ecbf630c85d94a42fe' // address: 0xDa5F16F4ab0410096a4403e7223988649fac38cF

export const PERMIT_ACCOUNT = privateKeyToAccount(PERMIT_PK)

export const DEFAULT_MIN_GAS_LIMIT = 55_000n

export const DEFAULT_PERMIT_GAS_LIMIT = 80000n

export const DEFAULT_PERMIT_VALUE = maxUint256

export const DEFAULT_PERMIT_DURATION = ms`5 years`
