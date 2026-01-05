import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'

import { ChainsToSelectState } from '../../../types'
import { chainPanelStateAtom, layoutStateAtom, selectTokenModalUIAtom, updateSelectTokenModalUIAtom } from '../atoms'
import { useWidgetCallbacks } from '../context/WidgetCallbacksContext'
import { useWidgetConfig } from '../context/WidgetConfigContext'

interface ChainState {
  isEnabled: boolean
  isVisible: boolean
  title: string
  chainsToSelect: ChainsToSelectState | undefined
  mobileChainsState: ChainsToSelectState | undefined
  isMobileChainPanelOpen: boolean
  isCompactLayout: boolean
  onSelectChain: (chain: ChainInfo) => void
  onOpenMobileChainPanel: () => void
  onCloseMobileChainPanel: () => void
}

export function useChainState(): ChainState {
  const { chainsToSelect, chainsPanelTitle } = useWidgetConfig()
  const { onSelectChain } = useWidgetCallbacks()
  const { isCompactLayout } = useAtomValue(layoutStateAtom)
  const { isEnabled, isVisible } = useAtomValue(chainPanelStateAtom)
  const { isMobileChainPanelOpen } = useAtomValue(selectTokenModalUIAtom)
  const updateModalUI = useSetAtom(updateSelectTokenModalUIAtom)

  const onOpenMobileChainPanel = useCallback(() => {
    updateModalUI({ isMobileChainPanelOpen: true })
  }, [updateModalUI])

  const onCloseMobileChainPanel = useCallback(() => {
    updateModalUI({ isMobileChainPanelOpen: false })
  }, [updateModalUI])

  const mobileChainsState = isEnabled && !isVisible ? chainsToSelect : undefined

  return {
    isEnabled,
    isVisible,
    title: chainsPanelTitle,
    chainsToSelect,
    mobileChainsState,
    isMobileChainPanelOpen,
    isCompactLayout,
    onSelectChain,
    onOpenMobileChainPanel,
    onCloseMobileChainPanel,
  }
}
