import { encodeAbiParameters, encodeFunctionData, keccak256, type Hex } from 'viem'

import { ComposableCowPollerAbi } from '@cowprotocol/cowswap-abis'

import { ComposableCowPollerSchedule } from './composable-cow-poller.constants'

export function encodePollFundsCalldata(scheduleId: Hex): Hex {
  return encodeFunctionData({
    abi: ComposableCowPollerAbi,
    functionName: 'pollFunds',
    args: [scheduleId],
  })
}

export function encodeRegisterFromShedCalldata(schedule: ComposableCowPollerSchedule): Hex {
  return encodeFunctionData({
    abi: ComposableCowPollerAbi,
    functionName: 'registerFromShed',
    args: [schedule],
  })
}

/**
 * App-data-independent schedule id: keccak256(abi.encode(funder, handler, owner, salt)).
 * Mirrors `ComposableCowPoller.scheduleId` identity fields (staticInput excluded).
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
