import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { CowEnv } from '@cowprotocol/cow-sdk'
import { SolanaTradingSdk } from '@cowprotocol/sdk-trading-solana'

export const SOLANA_TRADING_ENV: CowEnv = isBarnBackendEnv ? 'staging' : 'prod'

export const solanaTradingSdk = new SolanaTradingSdk({ env: SOLANA_TRADING_ENV })
