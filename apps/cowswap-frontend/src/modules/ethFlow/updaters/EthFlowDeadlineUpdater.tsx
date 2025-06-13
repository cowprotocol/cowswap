import { useEffect, useRef } from 'react'

import { MINIMUM_ETH_FLOW_DEADLINE_SECONDS } from '@cowprotocol/common-const'
import { loadJsonFromLocalStorage, setJsonToLocalStorage } from '@cowprotocol/common-utils'
import { StatefulValue } from '@cowprotocol/types'

import { useIsEoaEthFlow } from 'modules/trade'

import { DeadlineSettings } from './types'

const LOCAL_STORAGE_KEY = 'UserDeadlineSettings'

interface EthFlowDeadlineUpdaterProps {
  deadlineState: StatefulValue<number>
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function EthFlowDeadlineUpdater({ deadlineState }: EthFlowDeadlineUpdaterProps) {
  // user deadline (in seconds)
  const [userDeadline, setUserDeadline] = deadlineState
  const isEoaEthFlow = useIsEoaEthFlow()

  // On updater mount, load previous deadline from localStorage and set it
  useEffect(() => {
    const { ethFlow } = _loadDeadline() || {}

    // If on load there's an efhFlow deadline stored and it's ethFlow, use it
    if (ethFlow && isEoaEthFlow) {
      setUserDeadline(ethFlow)
    }

    // we only want this on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ref used to track when EthFlow is disabled
  const wasEthFlowActive = useRef(false)

  useEffect(() => {
    if (isEoaEthFlow) {
      // Load what's stored
      const { regular, ethFlow } = _loadDeadline() || {}
      // Set the flag
      wasEthFlowActive.current = true

      if (userDeadline >= MINIMUM_ETH_FLOW_DEADLINE_SECONDS) {
        // Valid deadline for ethflow. No need to update global state
        // But do update local storage with new ethflow value
        _saveDeadline({
          // Re-use the value stored or use current deadline if nothing is stored
          regular: regular || userDeadline,
          // Store it as ethflow deadline
          ethFlow: userDeadline,
        })
      } else {
        // Current deadline is too short
        // Use what's stored. If that's not valid, use the minimum value
        const newDeadline =
          ethFlow && ethFlow > MINIMUM_ETH_FLOW_DEADLINE_SECONDS ? ethFlow : MINIMUM_ETH_FLOW_DEADLINE_SECONDS
        // Set that on global state
        setUserDeadline(newDeadline)
        // Update local storage
        _saveDeadline({
          // Store previous value as regular
          regular: userDeadline,
          // Use new value as ethflow
          ethFlow: newDeadline,
        })
      }
    } else if (wasEthFlowActive.current) {
      // Only when disabling EthFlow, reset to previous regular value
      _resetDeadline(setUserDeadline)
      // Disable the flag
      wasEthFlowActive.current = false
    }
  }, [isEoaEthFlow, setUserDeadline, userDeadline])

  return null
}

function _saveDeadline(currentUserDeadline: DeadlineSettings): void {
  setJsonToLocalStorage(LOCAL_STORAGE_KEY, currentUserDeadline)
}

function _loadDeadline(): DeadlineSettings | null {
  return loadJsonFromLocalStorage(LOCAL_STORAGE_KEY)
}

function _resetDeadline(setUserDeadline: (deadline: number) => void): void {
  const { regular } = _loadDeadline() || {}
  // user switched back to non-native swap, set deadline back to previous value
  regular && setUserDeadline(regular)
}
