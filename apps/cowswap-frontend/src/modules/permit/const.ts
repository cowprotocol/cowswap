import { MaxUint256 } from '@ethersproject/constants'
import { Wallet } from '@ethersproject/wallet'

import ms from 'ms.macro'

// PK used only for signing permit requests for quoting and identifying token 'permittability'
// Do not use or try to send funds to it. Or do. It'll be your funds 🤷
const PERMIT_PK = '0xd0683148c0c6116a3f47340cf088de2fd791304b57d723e46a7f54504edf2cf2'

export const PERMIT_SIGNER = new Wallet(PERMIT_PK)

export const PERMIT_GAS_LIMIT_MIN = 55_000

export const DEFAULT_PERMIT_VALUE = MaxUint256.toString()

export const DEFAULT_PERMIT_DURATION = ms`5 years`
