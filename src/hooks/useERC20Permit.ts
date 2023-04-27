import { BigNumber } from '@ethersproject/bignumber'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export enum PermitType {
  AMOUNT = 1,
  ALLOWED = 2,
}

export interface PermitInfo {
  type: PermitType
  name: string
  // version is optional, and if omitted, will not be included in the domain
  version?: string
}

export enum UseERC20PermitState {
  // returned for any reason, e.g. it is an argent wallet, or the currency does not support it
  NOT_APPLICABLE,
  LOADING,
  NOT_SIGNED,
  SIGNED,
}

interface BaseSignatureData {
  v: number
  r: string
  s: string
  deadline: number
  nonce: number
  owner: string
  spender: string
  chainId: number
  tokenAddress: string
  permitType: PermitType
}

interface StandardSignatureData extends BaseSignatureData {
  amount: string
}

interface AllowedSignatureData extends BaseSignatureData {
  allowed: true
}

export type SignatureData = StandardSignatureData | AllowedSignatureData

/* eslint-disable @typescript-eslint/no-unused-vars */
export function useERC20Permit(
  currencyAmount: CurrencyAmount<Currency> | null | undefined,
  spender: string | null | undefined,
  transactionDeadline: BigNumber | undefined,
  overridePermitInfo: PermitInfo | undefined | null
): {
  signatureData: SignatureData | null
  state: UseERC20PermitState
  gatherPermitSignature: null | (() => Promise<void>)
} {
  // Mod: make useERC20Permit a noop. Permissable ERC20 currently not supported by our contracts
  return {
    signatureData: null,
    state: UseERC20PermitState.NOT_APPLICABLE,
    gatherPermitSignature: null,
  }
}
