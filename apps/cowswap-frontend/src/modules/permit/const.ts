import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { MaxUint256 } from '@ethersproject/constants'

import ms from 'ms.macro'

import { buildFakeSigner } from './utils/buildFakeSigner'

export const FAKE_SIGNER = buildFakeSigner()

export const PERMIT_GAS_LIMIT_MIN: Record<SupportedChainId, number> = {
  1: 55_000,
  100: 55_000,
  5: 55_000,
}

export const DEFAULT_PERMIT_VALUE = MaxUint256.toString()

export const DEFAULT_PERMIT_DEADLINE = ms`5 years`
