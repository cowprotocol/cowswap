import { BigNumber } from '@ethersproject/bignumber'
import { Percent } from '@uniswap/sdk-core'

import ms from 'ms.macro'

export const HIGH_FEE_WARNING_PERCENTAGE = new Percent(1, 10)

export const SAFE_COW_APP_LINK = 'https://app.safe.global/share/safe-app?appUrl=https%3A%2F%2Fswap.cow.fi&chain=eth'

export const MAX_ORDER_DEADLINE = ms`182d` + ms`12h` // 6 months, matching backend's https://github.com/cowprotocol/infrastructure/blob/901ed8e2fe3ea57956585f107bdd7539c2e7d3d1/services/Pulumi.yaml#L15

// Use a 150K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
export const APPROVE_GAS_LIMIT_DEFAULT = BigNumber.from('150000')
