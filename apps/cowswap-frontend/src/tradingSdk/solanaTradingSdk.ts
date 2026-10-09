import { backendEnv } from '@cowprotocol/common-utils'
import { SolanaTradingSdk } from '@cowprotocol/sdk-trading-solana'

export const solanaTradingSdk = new SolanaTradingSdk({ env: backendEnv })
