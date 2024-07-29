import { MaxUint256 } from '@ethersproject/constants'
import { Wallet } from '@ethersproject/wallet'

import ms from 'ms.macro'

// PK used only for signing permit requests for quoting and identifying token 'permittability'
// Do not use or try to send funds to it. Or do. It'll be your funds 🤷
const PERMIT_PK = '0x68012a4467ce455b6b278b1a6815db9b7224deaa6bced68c3848ec21e6380f8a' // address: 0xD711bD26Bf5B153001a7C0ACcb289782b6f775e9

export const PERMIT_SIGNER = new Wallet(PERMIT_PK)

export const DEFAULT_MIN_GAS_LIMIT = 55_000

export const DEFAULT_PERMIT_GAS_LIMIT = '80000'

export const DEFAULT_PERMIT_VALUE = MaxUint256.toString()

export const DEFAULT_PERMIT_DURATION = ms`5 years`
