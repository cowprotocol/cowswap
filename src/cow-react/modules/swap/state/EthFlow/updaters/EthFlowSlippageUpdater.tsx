import { Percent } from '@uniswap/sdk-core'
import { useEffect, useRef } from 'react'
import { useSetUserSlippageTolerance, useUserSlippageTolerance } from 'state/user/hooks'
import { useIsEthFlow } from '@cow/modules/swap/hooks/useIsEthFlow'
import { loadJsonFromLocalStorage, setJsonToLocalStorage } from '@cow/utils/localStorage'
import { SerializedSlippage, SerializedSlippageSettings, Slippage, SlippageSettings } from './types'

export const ETH_FLOW_SLIPPAGE = new Percent(2, 100) // 2%
const LOCAL_STORAGE_KEY = 'UserSlippageSettings'

export function EthFlowSlippageUpdater() {
  const currentSlippage = useUserSlippageTolerance()
  const setUserSlippageTolerance = useSetUserSlippageTolerance()
  const isEthFlow = useIsEthFlow()

  // On updater mount, load previous slippage from localStorage and set it
  useEffect(() => {
    const { ethFlow } = _loadSlippage()

    if (
      isEthFlow &&
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
    if (isEthFlow) {
      // Load what's stored
      const { regular, ethFlow } = _loadSlippage()

      // Set the flag
      wasEthFlowActive.current = true

      if (
        currentSlippage === 'auto' ||
        (!currentSlippage.greaterThan(ETH_FLOW_SLIPPAGE) && !currentSlippage.equalTo(ETH_FLOW_SLIPPAGE))
      ) {
        // If current slippage is auto or if it's smaller than ETH flow slippage, update it

        // If the former ethFlow slippage was saved, use that. Otherwise pick the minimum
        const newSlippage =
          ethFlow !== 'auto' && ethFlow && ethFlow.greaterThan(ETH_FLOW_SLIPPAGE) ? ethFlow : ETH_FLOW_SLIPPAGE

        // Update the global state
        setUserSlippageTolerance(newSlippage)

        // Update local storage
        _saveSlippage({ regular: regular || currentSlippage, ethFlow: newSlippage })
      } else {
        // If current slippage is NOT auto and it's greater than minimum, store that locally
        _saveSlippage({ regular, ethFlow: currentSlippage })
      }
    } else if (wasEthFlowActive.current) {
      // Only when disabling EthFlow, reset to previous regular value
      _resetSlippage(setUserSlippageTolerance)
      // Disable the flag
      wasEthFlowActive.current = false
    }
  }, [setUserSlippageTolerance, isEthFlow, currentSlippage])

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

function _resetSlippage(setUserSlippageTolerance: (slippageTolerance: Slippage) => void): void {
  const { regular, ethFlow } = _loadSlippage()
  // user switched back to non-native swap, set slippage back to previous value
  setUserSlippageTolerance(regular || 'auto')
  // Removing it from storage to avoid issues when coming back
  _saveSlippage({ ethFlow })
}
