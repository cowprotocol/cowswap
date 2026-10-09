import { SolanaTradingSdk } from '@cowprotocol/sdk-trading-solana'

import { SOLANA_TRADING_ENV } from './solanaTradingEnv'

export const solanaTradingSdk = new SolanaTradingSdk({ env: SOLANA_TRADING_ENV })
