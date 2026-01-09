import type { TypedDataField } from '@ethersproject/abstract-signer'

export const AFFILIATE_TYPED_DATA_DOMAIN = {
  name: 'CoW Swap Affiliate',
  version: '1',
} as const

export const AFFILIATE_TYPED_DATA_TYPES: Record<string, TypedDataField[]> = {
  AffiliateCode: [
    { name: 'walletAddress', type: 'address' },
    { name: 'code', type: 'string' },
  ],
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function buildAffiliateTypedData(params: { walletAddress: string; code: string }) {
  return {
    domain: {
      ...AFFILIATE_TYPED_DATA_DOMAIN,
    },
    types: AFFILIATE_TYPED_DATA_TYPES,
    message: {
      walletAddress: params.walletAddress,
      code: params.code,
    },
  }
}
