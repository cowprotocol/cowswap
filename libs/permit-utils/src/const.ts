import { MaxUint256 } from '@ethersproject/constants'
import { Wallet } from '@ethersproject/wallet'

import ms from 'ms.macro'

// PK used only for signing permit requests for quoting and identifying token 'permittability'
// Do not use or try to send funds to it. Or do. It'll be your funds 🤷
const PERMIT_PK = '0xa50dc0f7fc051309434deb3b1c71e927dbb711759231d8ecbf630c85d94a42fe' // address: 0xDa5F16F4ab0410096a4403e7223988649fac38cF

export const PERMIT_SIGNER = new Wallet(PERMIT_PK)

export const DEFAULT_MIN_GAS_LIMIT = 55_000

export const DEFAULT_PERMIT_GAS_LIMIT = '80000'

export const DEFAULT_PERMIT_VALUE = MaxUint256.toString()

export const DEFAULT_PERMIT_DURATION = ms`5 years`
