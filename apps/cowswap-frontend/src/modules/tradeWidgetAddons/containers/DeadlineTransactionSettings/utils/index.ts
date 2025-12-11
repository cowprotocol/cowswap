import {
  DEFAULT_DEADLINE_FROM_NOW,
  MINIMUM_ETH_FLOW_DEADLINE_SECONDS,
  MINIMUM_ORDER_VALID_TO_TIME_SECONDS,
} from '@cowprotocol/common-const'

const MAX_EOA_DEADLINE_MINUTES = 60 * 3 // 3h
const MAX_SC_DEADLINE_MINUTES = 60 * 12 // 12h

export function getDeadlineRange(isEoaEthFlow: boolean, isSmartContractWallet: boolean): [number, number] {
  const minDeadline = isEoaEthFlow
    ? // 10 minute low threshold for eth flow
      MINIMUM_ETH_FLOW_DEADLINE_SECONDS
    : MINIMUM_ORDER_VALID_TO_TIME_SECONDS
  const maxDeadline = (isSmartContractWallet ? MAX_SC_DEADLINE_MINUTES : MAX_EOA_DEADLINE_MINUTES) * 60
  return [minDeadline, maxDeadline]
}

export function deadlineToView(deadlineInput: string, deadline: number): string {
  return deadlineInput.length > 0
    ? deadlineInput
    : deadline === DEFAULT_DEADLINE_FROM_NOW
      ? ''
      : (deadline / 60).toString()
}
