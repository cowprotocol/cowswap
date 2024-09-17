import { COW } from '@cowprotocol/common-const'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import { AirdropOption } from './types'

const cowSepolia = COW[SupportedChainId.SEPOLIA]

// Update this list to add a new airdrop into the UI
// For more information: https://github.com/bleu/cow-airdrop-contract-deployer
export const AIRDROP_OPTIONS = [
  {
    name: 'COW',
    dataBaseUrl: 'https://raw.githubusercontent.com/bleu/cow-airdrop-contract-deployer/example/mock-airdrop-data/',
    chainId: SupportedChainId.SEPOLIA,
    address: '0xD1fB81659c434DDebC8468713E482134be0D85C0',
    token: TokenWithLogo.fromToken(
      new Token(cowSepolia.chainId, cowSepolia.address, cowSepolia.decimals, cowSepolia.symbol, cowSepolia.name),
      cowSepolia.logoURI,
    ),
  },
  // {
  //   name: 'YYY',
  //   dataBaseUrl: 'todo/',
  //   chainId: SupportedChainId.SEPOLIA
  //   address: ''
  //   token: {},
  //   },
  // },
] as AirdropOption[]
