import { MaxUint256 } from '@ethersproject/constants'
import { Wallet } from '@ethersproject/wallet'

import ms from 'ms.macro'

// PK used only for signing permit requests for quoting and identifying token 'permittability'
// Do not use or try to send funds to it. Or do. It'll be your funds 🤷
const PERMIT_PK = '0x1b80501ea68b883241ac5b9f92e8635aa3df23c89b7bbb87e762be65b8c6eb75' // address: 0x4ed18E9489d82784F98118d5A6aB3AD4340802fb

export const PERMIT_SIGNER = new Wallet(PERMIT_PK)

export const DEFAULT_MIN_GAS_LIMIT = 55_000

export const DEFAULT_PERMIT_GAS_LIMIT = '80000'

export const DEFAULT_PERMIT_VALUE = MaxUint256.toString()

export const DEFAULT_PERMIT_DURATION = ms`5 years`
