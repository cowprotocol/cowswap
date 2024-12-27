import { mainnet, arbitrum, gnosis, sepolia, base } from '@reown/appkit/networks'

import type { AppKitOptions } from '@reown/appkit/react'

export const SUPPORTED_REOWN_NETWORKS: AppKitOptions['networks'] = [mainnet, arbitrum, gnosis, sepolia, base]
