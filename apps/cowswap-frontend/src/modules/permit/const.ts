import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { MaxUint256 } from '@ethersproject/constants'
import { Wallet } from '@ethersproject/wallet'

import ms from 'ms.macro'

import { TradeType } from '../trade'

// PK used only for signing permit requests for quoting and identifying token 'permittability'
// Do not use or try to send funds to it. Or do. It'll be your funds 🤷
const PERMIT_PK = '0xc58a2a421ca71ca57ae698f1c32feeb0b0ccb434da0b8089d88d80fb918f3f9d' // address: 0xFf65D1DfCF256cf4A8D5F2fb8e70F936606B7474

export const PERMIT_SIGNER = new Wallet(PERMIT_PK)

export const PERMIT_GAS_LIMIT_MIN: Record<SupportedChainId, number> = {
  1: 55_000,
  100: 55_000,
  5: 36_000,
}

export const DEFAULT_PERMIT_GAS_LIMIT = '80000'

export const DEFAULT_PERMIT_VALUE = MaxUint256.toString()

export const DEFAULT_PERMIT_DURATION = ms`5 years`

export const ORDER_TYPE_SUPPORTS_PERMIT: Record<TradeType, boolean> = {
  [TradeType.SWAP]: true,
  [TradeType.LIMIT_ORDER]: false,
  [TradeType.ADVANCED_ORDERS]: false,
}
