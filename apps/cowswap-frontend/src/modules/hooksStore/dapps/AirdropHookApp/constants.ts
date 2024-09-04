import { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface AirdropOption {
  name: string
  dataBaseUrl: string
  decimals: number
  addressesMapping: Record<SupportedChainId, string>
}

export const AIRDROP_OPTIONS = [
  {
    name: 'COW',
    dataBaseUrl: 'https://raw.githubusercontent.com/bleu/cow-airdrop-token-mock/main/mock-airdrop-data/',
    addressesMapping: {
      [SupportedChainId.SEPOLIA]: '0x665a921D720D27118ae4f9D1fA98976FEad04e5A',
    },
    decimals: 18,
  },
] as AirdropOption[]
