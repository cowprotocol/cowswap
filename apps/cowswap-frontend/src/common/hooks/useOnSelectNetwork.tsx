import { useCallback } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAddSnackbar } from '@cowprotocol/snackbars'
import { useSwitchNetwork, useWalletInfo } from '@cowprotocol/wallet'

import { useCloseModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

import { useTradeNavigate } from 'modules/trade/hooks/useTradeNavigate'
import { getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'
import { useSetWalletConnectionError } from 'modules/wallet/hooks/useSetWalletConnectionError'

import { useLegacySetChainIdToUrl } from './useLegacySetChainIdToUrl'

export function useOnSelectNetwork(): (chainId: SupportedChainId, skipClose?: boolean) => Promise<void> {
  const { active } = useWalletInfo()
  const switchNetwork = useSwitchNetwork()
  const tradeNavigate = useTradeNavigate()
  const addSnackbar = useAddSnackbar()
  const closeModal = useCloseModal(ApplicationModal.NETWORK_SELECTOR)
  const setChainIdToUrl = useLegacySetChainIdToUrl()
  const setWalletConnectionError = useSetWalletConnectionError()

  return useCallback(
    async (targetChain: SupportedChainId, skipClose?: boolean) => {
      try {
        setWalletConnectionError(undefined)
        if (active) {
          await switchNetwork(targetChain)
          // When wallet is not connected, then only change the chainId in URL
        } else {
          tradeNavigate(targetChain, getDefaultTradeRawState(targetChain))
        }
        setChainIdToUrl(targetChain)
      } catch (error: any) {
        console.error('Failed to switch networks', error)

        if (isRejectRequestProviderError(error)) {
          return
        }

        addSnackbar({
          id: 'failed-network-switch',
          icon: 'alert',
          content: (
            <>
              Failed to switch networks from the CoW Swap Interface. In order to use CoW Swap on{' '}
              {getChainInfo(targetChain)?.label}, you must change the network in your wallet.
            </>
          ),
        })

        setWalletConnectionError(error.message)
      }

      if (!skipClose) {
        closeModal()
      }
    },
    [active, switchNetwork, tradeNavigate, setWalletConnectionError, addSnackbar, closeModal, setChainIdToUrl]
  )
}
