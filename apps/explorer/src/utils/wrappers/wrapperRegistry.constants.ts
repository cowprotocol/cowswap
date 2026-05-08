import { WrapperInfo, WrapperRegistryEntry } from './wrapperRegistry.types'

// Euler brand shared across all three EVC wrapper entries.
// Image: the standalone symbol (three-stripe ε mark) per Euler's brand guidelines —
// symbol is recommended when space is limited. Colored version on dark background.
// Source: Trust Wallet assets (stable public CDN for DeFi protocol logos).
const EULER_BRAND = {
  image:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xd9Fcd98c322942075A5C3860693e9f4f03AAE07b/logo.png',
  website: 'https://euler.finance',
} as const satisfies Partial<WrapperInfo>

// Registry keyed by lowercase contract address. Add a new entry per wrapper using a
// dedicated file (or shared file for related wrappers) under utils/wrappers/.
export const WRAPPERS_BY_ADDRESS = {
  // Euler EVC wrappers (mainnet)
  '0x59684a689d4a1cac0f0632f54ec8cdd42612d728': {
    info: {
      ...EULER_BRAND,
      name: 'Euler EVC – Open Position',
      description:
        'Opens a leveraged position by enabling collateral, enabling a borrow vault, depositing collateral, and borrowing assets.',
    },
    loadComponent: () => import('./eulerEvc').then((m) => m.EulerOpenPositionItem),
  },
  '0xa18c87849ef90190117ff1e1e8b4ace6dac7a54b': {
    info: {
      ...EULER_BRAND,
      name: 'Euler EVC – Close Position',
      description:
        'Closes a leveraged position by transferring collateral, swapping it for debt assets, and repaying the borrow vault.',
    },
    loadComponent: () => import('./eulerEvc').then((m) => m.EulerClosePositionItem),
  },
  '0x175fbd01874e92c9b081f493371fefe009760a42': {
    info: {
      ...EULER_BRAND,
      name: 'Euler EVC – Collateral Swap',
      description: 'Atomically swaps collateral between two Euler vaults, optionally disabling the source collateral.',
    },
    loadComponent: () => import('./eulerEvc').then((m) => m.EulerCollateralSwapItem),
  },
} as const satisfies Record<string, WrapperRegistryEntry>
