import { areAddressesEqual, SupportedChainId } from '@cowprotocol/cow-sdk'

import { GtmEvent } from '../types'

export interface ChainSwitchPayload {
  account: string
  prevAccount: string
  chainId: SupportedChainId
  prevChainId: SupportedChainId
}

export type ChainSwitchGuardInput = { [K in keyof ChainSwitchPayload]: ChainSwitchPayload[K] | null | undefined }

export function getChainContextValue(chainId: SupportedChainId | undefined): string | undefined {
  return chainId?.toString()
}

export function shouldTrackChainSwitchedEvent(input: ChainSwitchGuardInput): input is ChainSwitchPayload {
  const { account, prevAccount, chainId, prevChainId } = input

  if (account == null || prevAccount == null || chainId == null || prevChainId == null) {
    return false
  }

  if (!areAddressesEqual(account, prevAccount)) {
    return false
  }

  return chainId !== prevChainId
}

export function getChainSwitchedEvent(
  previousChainId: SupportedChainId,
  newChainId: SupportedChainId,
): GtmEvent<'Wallet'> {
  return {
    category: 'Wallet',
    action: 'chain_switched',
    previousChainId: previousChainId.toString(),
    newChainId: newChainId.toString(),
  }
}
