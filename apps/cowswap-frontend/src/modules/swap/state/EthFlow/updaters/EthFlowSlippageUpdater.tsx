import { useEffect, useRef } from 'react'

import { MINIMUM_ETH_FLOW_SLIPPAGE } from '@cowprotocol/common-const'
import { loadJsonFromLocalStorage, setJsonToLocalStorage } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Percent } from '@uniswap/sdk-core'

import { useSetUserSlippageTolerance, useUserSlippageTolerance } from 'legacy/state/user/hooks'

import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'

import { SerializedSlippage, SerializedSlippageSettings, Slippage, SlippageSettings } from './types'

const LOCAL_STORAGE_KEY = 'UserSlippageSettings'

export function EthFlowSlippageUpdater() {
  const currentSlippage = useUserSlippageTolerance()
  const setUserSlippageTolerance = useSetUserSlippageTolerance()
  const isEoaEthFlow = useIsEoaEthFlow()
  const { chainId } = useWalletInfo()
  const minEthFlowSlippage = MINIMUM_ETH_FLOW_SLIPPAGE[chainId]

  // On updater mount, load previous slippage from localStorage and set it
  useEffect(() => {
    const { ethFlow } = _loadSlippage()

    if (
      isEoaEthFlow &&
      ethFlow &&
      ((currentSlippage === 'auto' && ethFlow !== 'auto') ||
        (currentSlippage instanceof Percent && ethFlow instanceof Percent && !currentSlippage.equalTo(ethFlow)))
    ) {
      // If ethFlow and there's an enflow stored which is not auto
      setUserSlippageTolerance(ethFlow)
    }

    // we only want this on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ref used to track when EthFlow is disabled
  const wasEthFlowActive = useRef(false)

  useEffect(() => {
    // Reset state when chain changes and ethflow was active
    wasEthFlowActive.current && _resetSlippage(setUserSlippageTolerance, false)
    wasEthFlowActive.current = false
  }, [chainId, setUserSlippageTolerance])

  useEffect(() => {
    if (isEoaEthFlow) {
      // Switching into ethflow.

      // Load what's stored
      const { regular, ethFlow } = _loadSlippage()

      // Set the flag
      wasEthFlowActive.current = true

      if (
        !currentSlippage ||
        currentSlippage === 'auto' ||
        (currentSlippage instanceof Percent && minEthFlowSlippage.greaterThan(currentSlippage))
      ) {
        // Previous slippage cannot be used as is.
        // Determine whether we should use stored ethflow value or the min ethflow value
        const newSlippage =
          ethFlow !== 'auto' && ethFlow && ethFlow.greaterThan(minEthFlowSlippage) ? ethFlow : minEthFlowSlippage

        // Update the global state
        setUserSlippageTolerance(newSlippage)

        // Update local storage
        _saveSlippage({
          regular: regular || currentSlippage,
          ethFlow: newSlippage.equalTo(minEthFlowSlippage) ? 'auto' : newSlippage,
        })
      } else {
        // Previous slippage is valid for ethflow
        _saveSlippage({
          regular: regular || currentSlippage,
          ethFlow: currentSlippage,
        })
      }
    } else if (wasEthFlowActive.current) {
      // Only when disabling EthFlow, reset to previous regular value
      _resetSlippage(setUserSlippageTolerance, true)
      // Disable the flag
      wasEthFlowActive.current = false
    }
  }, [setUserSlippageTolerance, isEoaEthFlow, currentSlippage, minEthFlowSlippage])

  return null
}

function _saveSlippage(slippageSettings: SlippageSettings): void {
  setJsonToLocalStorage(LOCAL_STORAGE_KEY, _serialize(slippageSettings))
}

function _serialize({ regular, ethFlow }: SlippageSettings): SerializedSlippageSettings {
  const slippage: SerializedSlippageSettings = {}

  if (regular) slippage.regular = _serializeSlippage(regular)
  if (ethFlow) slippage.ethFlow = _serializeSlippage(ethFlow)

  return slippage
}

function _serializeSlippage(slippage: Slippage): SerializedSlippage {
  return slippage instanceof Percent ? [slippage.numerator.toString(), slippage.denominator.toString()] : slippage
}

function _loadSlippage(): SlippageSettings {
  const slippageSettings = loadJsonFromLocalStorage<SerializedSlippageSettings>(LOCAL_STORAGE_KEY)

  return _deserialize(slippageSettings)
}

function _deserialize(settings: SerializedSlippageSettings | null): SlippageSettings {
  const { regular, ethFlow } = settings || {}

  const slippage: SlippageSettings = {}

  if (regular) slippage.regular = _deserializeSlippage(regular)
  if (ethFlow) slippage.ethFlow = _deserializeSlippage(ethFlow)

  return slippage
}

function _deserializeSlippage(slippage: SerializedSlippage | undefined): Slippage | undefined {
  return !slippage ? undefined : slippage === 'auto' ? 'auto' : new Percent(slippage[0], slippage[1])
  // return slippage === 'auto' || !slippage ? 'auto' : new Percent(slippage[0], slippage[1])
}

function _resetSlippage(setUserSlippageTolerance: (slippageTolerance: Slippage) => void, keepEthFlow?: boolean): void {
  const { regular, ethFlow } = _loadSlippage()
  // user switched back to non-native swap, set slippage back to previous value
  setUserSlippageTolerance(regular || 'auto')
  // Removing it from storage to avoid issues when coming back
  _saveSlippage({ ethFlow: keepEthFlow ? ethFlow : 'auto' })
}
