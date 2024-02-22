import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import {
  UpdateParamsPayload,
  WidgetMethodsEmit,
  WidgetMethodsListen,
  listenToMessageFromWindow,
  postMessageToWindow,
  stopListeningWindowListener,
} from '@cowprotocol/widget-lib'

import { useNavigate } from 'react-router-dom'

import { useConnectWallet, useDisconnectWallet } from 'modules/account/hooks/useDisconnectWallet'

import { IframeResizer } from './IframeResizer'

import { COW_SWAP_WIDGET_EVENT_KEY } from '../consts'
import { injectedWidgetMetaDataAtom } from '../state/injectedWidgetMetaDataAtom'
import { injectedWidgetParamsAtom } from '../state/injectedWidgetParamsAtom'

const messagesCache: { [method: string]: unknown } = {}

const getEventMethod = (event: MessageEvent) =>
  (event.data.key === COW_SWAP_WIDGET_EVENT_KEY && (event.data.method as string)) || null

const cacheMessages = (event: MessageEvent) => {
  const method = getEventMethod(event)

  if (!method) return

  messagesCache[method] = event.data
}

/**
 * To avoid delays, immediately send an activation message and start listening messages
 */
;(function initInjectedWidget() {
  const isInIframe = window.top !== window.self

  if (!window.top || !isInIframe) return

  window.addEventListener('message', cacheMessages)

  postMessageToWindow(window.top, WidgetMethodsEmit.ACTIVATE, void 0)
})()

export function InjectedWidgetUpdater() {
  const updateParams = useSetAtom(injectedWidgetParamsAtom)
  const updateMetaData = useSetAtom(injectedWidgetMetaDataAtom)

  const navigate = useNavigate()
  const prevData = useRef<UpdateParamsPayload | null>(null)

  const { account } = useWalletInfo()
  // const [triggerDisconnect, setTriggerDisconnect] = useState(false)
  const diconnectWallet = useDisconnectWallet()
  const diconnectWalletRef = useRef(diconnectWallet)
  diconnectWalletRef.current = diconnectWallet

  const connectWallet = useConnectWallet()
  const connectWalletRef = useRef(connectWallet)

  const isConnected = !!account
  const hideConnectButton = prevData?.current?.appParams.hideConnectButton
  const hasProvider = prevData?.current?.hasProvider

  useEffect(() => {
    if (!hideConnectButton) return

    if (hasProvider) {
      // Disconnect if we don't have a provider, and we are still not connected
      if (!isConnected) {
        console.log('[TEST]: Connect wallet', { hideConnectButton, isConnected, hasProvider })
        connectWalletRef.current()
      }
    } else {
      // Connect if we have a provider, and we are still not connected
      if (isConnected) {
        console.log('[TEST]: Disconnecting wallet', { hideConnectButton, isConnected, hasProvider })
        diconnectWalletRef.current()
      }
    }
    // setTriggerDisconnect(false)
  }, [isConnected, hideConnectButton, hasProvider])

  useEffect(() => {
    // Stop listening of message outside of React
    window.removeEventListener('message', cacheMessages)

    // Start listening messages inside of React
    const updateParamsListener = listenToMessageFromWindow(window, WidgetMethodsListen.UPDATE_PARAMS, (data) => {
      // if (prevData.current && deepEqual(prevData.current, data)) return

      // Update params
      prevData.current = data
      updateParams(data.appParams)

      // Navigate to the new path
      navigate(data.urlParams)
    })

    const updateAppDataListener = listenToMessageFromWindow(window, WidgetMethodsListen.UPDATE_APP_DATA, (data) => {
      if (data.metaData) {
        updateMetaData(data.metaData)
      }
    })

    // Process all cached messages
    Object.keys(messagesCache).forEach((method) => {
      postMessageToWindow(window, method as any, messagesCache[method])

      delete messagesCache[method]
    })

    return () => {
      stopListeningWindowListener(window, updateParamsListener)
      stopListeningWindowListener(window, updateAppDataListener)
    }
  }, [updateMetaData, navigate, updateParams])

  return <IframeResizer />
}
