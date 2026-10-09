import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { CowEnv } from '@cowprotocol/cow-sdk'

export const SOLANA_TRADING_ENV: CowEnv = isBarnBackendEnv ? 'staging' : 'prod'
