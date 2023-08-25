import { SupportedChainId } from '@cowprotocol/cow-sdk'

export type SupportedPermitInfo = {
  type: 'dai' | 'permit'
  gasLimit: number
}
type UnsupportedPermitInfo = false
export type PermitInfo = SupportedPermitInfo | UnsupportedPermitInfo

export type PermittableTokens = Record<SupportedChainId, Record<string, PermitInfo>>

export type IsTokenPermittableResult = PermitInfo | undefined

export type AddPermitTokenParams = {
  chainId: SupportedChainId
  tokenAddress: string
  permitInfo: PermitInfo
}

export type EstimatePermitResult =
  // When it's a permittable token:
  | {
      type: 'dai' | 'permit'
      gasLimit: number
    }
  // When something failed:
  | { error: string }
  // When it's not permittable:
  | null
