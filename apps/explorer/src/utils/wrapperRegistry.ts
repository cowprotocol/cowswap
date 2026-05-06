import { ComponentType } from 'react'

export interface WrapperInfo {
  name: string
  description?: string
  image?: string
  website?: string
}

export interface WrapperRegistryEntry {
  info: WrapperInfo
  // Dynamically imports the component that decodes and renders the WrapperEntry.data
  // field. The dynamic import enables code splitting: wrapper render code is only
  // fetched when an order actually uses that wrapper address.
  loadComponent: () => Promise<ComponentType<{ data: string }>>
}

// Euler brand shared across all three EVC wrapper entries.
// Image: the standalone symbol (three-stripe ε mark) per Euler's brand guidelines —
// symbol is recommended when space is limited. Colored version on dark background.
// Source: Trust Wallet assets (stable public CDN for DeFi protocol logos).
const EULER_BRAND = {
  image:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xd9Fcd98c322942075A5C3860693e9f4f03AAE07b/logo.png',
  website: 'https://euler.finance',
}

// Registry keyed by lowercase contract address. Add a new entry per wrapper using a
// dedicated file (or shared file for related wrappers) under utils/wrappers/.
export const WRAPPERS_BY_ADDRESS: Record<string, WrapperRegistryEntry> = {
  // Euler EVC wrappers (mainnet)
  '0x59684a689d4a1cac0f0632f54ec8cdd42612d728': {
    info: {
      ...EULER_BRAND,
      name: 'Euler EVC – Open Position',
      description:
        'Opens a leveraged position by enabling collateral, enabling a borrow vault, depositing collateral, and borrowing assets.',
    },
    loadComponent: () => import('./wrappers/eulerEvc').then((m) => m.OpenPositionComponent),
  },
  '0xa18c87849ef90190117ff1e1e8b4ace6dac7a54b': {
    info: {
      ...EULER_BRAND,
      name: 'Euler EVC – Close Position',
      description:
        'Closes a leveraged position by transferring collateral, swapping it for debt assets, and repaying the borrow vault.',
    },
    loadComponent: () => import('./wrappers/eulerEvc').then((m) => m.ClosePositionComponent),
  },
  '0x175fbd01874e92c9b081f493371fefe009760a42': {
    info: {
      ...EULER_BRAND,
      name: 'Euler EVC – Collateral Swap',
      description: 'Atomically swaps collateral between two Euler vaults, optionally disabling the source collateral.',
    },
    loadComponent: () => import('./wrappers/eulerEvc').then((m) => m.CollateralSwapComponent),
  },
}
