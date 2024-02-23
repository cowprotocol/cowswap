import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { deepEqual } from '@cowprotocol/common-utils'
import {
  UpdateParamsPayload,
  WidgetMethodsEmit,
  WidgetMethodsListen,
  listenToMessageFromWindow,
  postMessageToWindow,
  stopListeningWindowListener,
} from '@cowprotocol/widget-lib'

import { useNavigate } from 'react-router-dom'

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

  useEffect(() => {
    // Stop listening of message outside of React
    window.removeEventListener('message', cacheMessages)

    // Start listening for messages inside of React
    const updateParamsListener = listenToMessageFromWindow(window, WidgetMethodsListen.UPDATE_PARAMS, (data) => {
      if (prevData.current && deepEqual(prevData.current, data)) return

      // TODO: Remove, for now I just want to mock a hardcoded fee. Also, i know I shouldn't mutate the param, this code will be killed in next PR anyways
      if (!data.appParams.partnerFee) {
        data.appParams.partnerFee = {
          bps: 35,
          recipient: '0x79063d9173C09887d536924E2F6eADbaBAc099f5',
        }
      }

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
