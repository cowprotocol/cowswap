import { atom } from 'jotai'

import { ActivityStatus } from 'common/types/activity'

export interface EthFlowActionContext {
  isNeeded: boolean
  txStatus: ActivityStatus | null
  txHash: string | null
  inProgress: boolean
}

export interface EthFlowContext {
  approve: EthFlowActionContext
  wrap: EthFlowActionContext
}

interface PartialEthFlowContext {
  approve?: Partial<EthFlowActionContext>
  wrap?: Partial<EthFlowActionContext>
}

export const defaultEthFlowContext: EthFlowContext = {
  approve: {
    isNeeded: false,
    txStatus: null,
    txHash: null,
    inProgress: false,
  },
  wrap: {
    isNeeded: false,
    txStatus: null,
    txHash: null,
    inProgress: false,
  },
}

export const ethFlowContextAtom = atom<EthFlowContext>(defaultEthFlowContext)

export const isEthFlowWalletActionPendingAtom = atom((get) => {
  const { approve, wrap } = get(ethFlowContextAtom)

  return approve.inProgress || wrap.inProgress
})

export const updateEthFlowContextAtom = atom(null, (get, set, nextState: PartialEthFlowContext) => {
  set(ethFlowContextAtom, () => {
    const prevState = get(ethFlowContextAtom)

    return {
      approve: { ...prevState.approve, ...nextState.approve },
      wrap: { ...prevState.wrap, ...nextState.wrap },
    }
  })
})

export const resetEthFlowContextAtom = atom(null, (get, set) => {
  set(ethFlowContextAtom, defaultEthFlowContext)
})
