import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'

import { deepEqual } from '@cowprotocol/common-utils'
import { WidgetMethodsEmit, WidgetMethodsListen, postMessageToWindow } from '@cowprotocol/widget-lib'

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
  const prevData = useRef(null)

  const processEvent = useCallback(
    (method: string, data: any) => {
      switch (method) {
        case WidgetMethodsListen.UPDATE_PARAMS:
          if (prevData.current && deepEqual(prevData.current, data)) return

          prevData.current = data
          updateParams(data.appParams)
          navigate(data.urlParams)
          break

        case WidgetMethodsListen.UPDATE_APP_DATA:
          if (data.metaData) {
            updateMetaData(data.metaData)
          }
          break
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Once app is loaded
  useEffect(() => {
    // Stop listening of message outside of React
    window.removeEventListener('message', cacheMessages)

    // Process all cached messages
    Object.keys(messagesCache).forEach((method) => {
      processEvent(method, messagesCache[method])

      delete messagesCache[method]
    })

    // Start listening messages inside of React
    window.addEventListener('message', (event) => {
      const method = getEventMethod(event)

      if (!method) return

      processEvent(method, event.data)
    })
  }, [processEvent])

  return <IframeResizer />
}
