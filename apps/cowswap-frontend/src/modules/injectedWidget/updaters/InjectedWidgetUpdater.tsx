import { useAtom, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { deepEqual } from '@cowprotocol/common-utils'
import {
  CowSwapWidgetAppParams,
  listenToMessageFromWindow,
  postMessageToWindow,
  stopListeningWindowListener,
  UpdateParamsPayload,
  WidgetMethodsEmit,
  WidgetMethodsListen,
} from '@cowprotocol/widget-lib'

import { useNavigate } from 'react-router-dom'

import { IframeResizer } from './IframeResizer'

import { COW_SWAP_WIDGET_EVENT_KEY } from '../consts'
import { WidgetParamsErrorsScreen } from '../pure/WidgetParamsErrorsScreen'
import { injectedWidgetMetaDataAtom } from '../state/injectedWidgetMetaDataAtom'
import { injectedWidgetParamsAtom } from '../state/injectedWidgetParamsAtom'
import { validateWidgetParams } from '../utils/validateWidgetParams'

const messagesCache: { [method: string]: unknown } = {}

const getEventMethod = (event: MessageEvent) =>
  (event.data.key === COW_SWAP_WIDGET_EVENT_KEY && (event.data.method as string)) || null

const cacheMessages = (event: MessageEvent) => {
  const method = getEventMethod(event)

  if (!method) return

  messagesCache[method] = event.data
}

const paramsWithoutPartnerFee = (params: CowSwapWidgetAppParams) => {
  const { partnerFee: _, ...rest } = params

  return rest
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
  const { isPartnerFeeEnabled } = useFeatureFlags()
  const [{ errors: validationErrors }, updateParams] = useAtom(injectedWidgetParamsAtom)
  const updateMetaData = useSetAtom(injectedWidgetMetaDataAtom)

  const navigate = useNavigate()
  const prevData = useRef<UpdateParamsPayload | null>(null)

  useEffect(() => {
    // Stop listening of message outside of React
    window.removeEventListener('message', cacheMessages)

    // Start listening for messages inside of React
    const updateParamsListener = listenToMessageFromWindow(window, WidgetMethodsListen.UPDATE_PARAMS, (data) => {
      if (prevData.current && deepEqual(prevData.current, data)) return

      // Update params
      prevData.current = data

      // Ignore partner fee value when feature flag is not enabled
      const appParams = isPartnerFeeEnabled ? data.appParams : paramsWithoutPartnerFee(data.appParams)

      const errors = validateWidgetParams(appParams)

      updateParams({
        params: appParams,
        errors,
      })

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
  }, [updateMetaData, navigate, updateParams, isPartnerFeeEnabled])

  return (
    <>
      <WidgetParamsErrorsScreen errors={validationErrors} />
      <IframeResizer />
    </>
  )
}
