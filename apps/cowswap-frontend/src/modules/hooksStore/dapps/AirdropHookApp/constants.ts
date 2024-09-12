import { COW } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { AirdropOption } from './types'

export const AIRDROP_OPTIONS = [
  {
    name: 'COW',
    dataBaseUrl: 'https://raw.githubusercontent.com/bleu/cow-airdrop-token-mock/main/mock-airdrop-data/',
    addressesMapping: {
      [SupportedChainId.SEPOLIA]: '0xD1fB81659c434DDebC8468713E482134be0D85C0',
    },
    tokenMapping: {
      [SupportedChainId.SEPOLIA]: {
        ...COW[SupportedChainId.SEPOLIA],
        address: '0x5fe27bf718937ca1c4a7818d246cd4e755c7470c',
      },
    },

    decimals: 18,
  },
] as AirdropOption[]
