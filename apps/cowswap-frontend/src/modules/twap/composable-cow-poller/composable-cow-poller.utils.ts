import {
  encodeAbiParameters,
  encodeFunctionData,
  keccak256,
  type Hex,
  type TypedDataDefinition,
  type TypedDataDomain,
} from 'viem'

import { type AccountAddress } from '@cowprotocol/cow-sdk'
import { ComposableCowPollerAbi } from '@cowprotocol/cowswap-abis'

import { ComposableCowPollerSchedule } from './composable-cow-poller.constants'

export function encodePollFundsCalldata(scheduleId: Hex): Hex {
  return encodeFunctionData({
    abi: ComposableCowPollerAbi,
    functionName: 'pollFunds',
    args: [scheduleId],
  })
}

export function encodeRegisterWithSignatureCalldata(
  schedule: ComposableCowPollerSchedule,
  deadline: bigint,
  signature: Hex,
): Hex {
  return encodeFunctionData({
    abi: ComposableCowPollerAbi,
    functionName: 'registerWithSignature',
    args: [schedule, deadline, signature],
  })
}

/**
 * App-data-independent schedule id: keccak256(abi.encode(funder, handler, owner, salt)).
 * Matches cow-sdk ComposableCowPoller.getScheduleId (#958).
 */
export function getComposableCowPollerScheduleId(
  schedule: Pick<ComposableCowPollerSchedule, 'funder' | 'handler' | 'owner' | 'salt'>,
): Hex {
  return keccak256(
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'address' }, { type: 'address' }, { type: 'bytes32' }],
      [schedule.funder, schedule.handler, schedule.owner, schedule.salt],
    ),
  )
}

const REGISTER_TYPES = {
  Register: [
    { name: 'handler', type: 'address' },
    { name: 'funder', type: 'address' },
    { name: 'owner', type: 'address' },
    { name: 'salt', type: 'bytes32' },
    { name: 'staticInputHash', type: 'bytes32' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const

export interface ComposableCowPollerRegisterTypedData {
  domain: TypedDataDomain
  types: typeof REGISTER_TYPES
  primaryType: 'Register'
  message: {
    handler: AccountAddress
    funder: AccountAddress
    owner: AccountAddress
    salt: Hex
    staticInputHash: Hex
    nonce: bigint
    deadline: bigint
  }
}

/**
 * EIP-712 payload for registerWithSignature (cow-sdk #959 / composable-cow #135).
 */
export function getComposableCowPollerRegisterTypedData({
  chainId,
  pollerAddress,
  schedule,
  nonce,
  deadline,
}: {
  chainId: number
  pollerAddress: AccountAddress
  schedule: ComposableCowPollerSchedule
  nonce: bigint
  deadline: bigint
}): ComposableCowPollerRegisterTypedData {
  return {
    domain: {
      name: 'ComposableCowPoller',
      version: '1',
      chainId,
      verifyingContract: pollerAddress,
    },
    types: REGISTER_TYPES,
    primaryType: 'Register',
    message: {
      handler: schedule.handler,
      funder: schedule.funder,
      owner: schedule.owner,
      salt: schedule.salt,
      staticInputHash: keccak256(schedule.staticInput),
      nonce,
      deadline,
    },
  }
}

/** Narrow typed-data for Signer.signTypedData without `any`. */
export function toSignTypedDataArgs(
  typedData: ComposableCowPollerRegisterTypedData,
): [TypedDataDomain, TypedDataDefinition['types'], Record<string, unknown>] {
  return [typedData.domain, typedData.types as TypedDataDefinition['types'], typedData.message]
}
