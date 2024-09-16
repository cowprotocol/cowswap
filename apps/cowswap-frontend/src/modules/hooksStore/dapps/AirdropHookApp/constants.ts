import { COW } from '@cowprotocol/common-const'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { AirdropOption } from './types'

function buildToken(tokenObj: {
  logoURI: string | undefined
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
  bypassChecksum?: boolean
}) {
  return new TokenWithLogo(
    tokenObj.logoURI,
    tokenObj.chainId,
    tokenObj.address,
    tokenObj.decimals,
    tokenObj.symbol,
    tokenObj.name,
  )
}

// Update this list to add a new airdrop into the UI
// For more information: https://github.com/bleu/cow-airdrop-contract-deployer
export const AIRDROP_OPTIONS = [
  {
    name: 'COW',
    dataBaseUrl: 'https://raw.githubusercontent.com/bleu/cow-airdrop-contract-deployer/example/mock-airdrop-data/',
    chainId: SupportedChainId.SEPOLIA,
    address: '0xD1fB81659c434DDebC8468713E482134be0D85C0',
    token: buildToken({
      ...COW[SupportedChainId.SEPOLIA],
      address: '0x5fe27bf718937ca1c4a7818d246cd4e755c7470c',
    }),
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
