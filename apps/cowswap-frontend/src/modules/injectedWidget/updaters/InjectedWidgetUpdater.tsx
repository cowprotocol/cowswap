import { useAtom, useSetAtom } from 'jotai'
import { ReactNode, useEffect, useRef } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { deepEqual } from '@cowprotocol/common-utils'
import { getParentOrigin } from '@cowprotocol/iframe-transport'
import {
  UpdateAppDataPayload,
  UpdateParamsPayload,
  widgetIframeTransport,
  WidgetMethodsEmit,
  WidgetMethodsListen,
} from '@cowprotocol/widget-lib'

import * as Sentry from '@sentry/browser'

import { useNavigate } from 'common/hooks/useNavigate'

import { IframeResizer } from './IframeResizer'

import { WidgetParamsErrorsScreen } from '../pure/WidgetParamsErrorsScreen'
import { injectedWidgetHooksEnabledAtom } from '../state/injectedWidgetHooksEnabledAtom'
import { injectedWidgetMetaDataAtom } from '../state/injectedWidgetMetaDataAtom'
import { injectedWidgetParamsAtom } from '../state/injectedWidgetParamsAtom'
import { validateWidgetParams } from '../utils/validateWidgetParams'
import {
  cacheWidgetMessage,
  clearCachedWidgetMessage,
  getCachedWidgetMessageMethods,
  registerCachedMessageHandler,
  replayCachedWidgetMessage,
} from '../utils/widgetMessagesCache.utils'

export function InjectedWidgetUpdater(): ReactNode {
  const [
    {
      errors: validationErrors,
      params: { partnerFee, appCode },
    },
    updateParams,
  ] = useAtom(injectedWidgetParamsAtom)
  const setHooksEnabled = useSetAtom(injectedWidgetHooksEnabledAtom)
  const updateMetaData = useSetAtom(injectedWidgetMetaDataAtom)

  const prevPartnerFee = usePrevious(partnerFee)
  const navigate = useNavigate()
  const prevData = useRef<UpdateParamsPayload | null>(null)
  const isReadySentRef = useRef(false)

  useEffect(() => {
    // Stop listening of message outside of React
    window.removeEventListener('message', cacheWidgetMessage)

    const parentOrigin = getParentOrigin()

    if (!parentOrigin) {
      return
    }

    const updateParamsHandler = (data: UpdateParamsPayload): void => {
      if (
        // If the data is the same as the previous data
        prevData.current &&
        deepEqual(prevData.current, data) &&
        // And the pathname is the same as the current widget pathname, do nothing
        // This is needed since the app updates the pathname independently of the widget params
        window.location.pathname === data.urlParams.pathname
      ) {
        return
      }

      // Update params
      prevData.current = data

      const appParams = data.appParams
      const hooksEnabled = new URLSearchParams(data.urlParams.search).get('hooksEnabled') === 'true'

      const errors = validateWidgetParams(appParams)
      setHooksEnabled(hooksEnabled)

      updateParams({
        params: appParams,
        errors,
      })

      // Navigate to the new path
      navigate(data.urlParams, { replace: true })
    }

    // Start listening for messages inside of React
    const updateParamsListener = widgetIframeTransport.listenToMessageFromWindow(
      window,
      window.parent,
      WidgetMethodsListen.UPDATE_PARAMS,
      updateParamsHandler,
      parentOrigin,
    )
    registerCachedMessageHandler(WidgetMethodsListen.UPDATE_PARAMS, updateParamsHandler)

    const updateAppDataHandler = (data: UpdateAppDataPayload): void => {
      if (data.metaData) {
        updateMetaData(data.metaData)
      }
    }

    const updateAppDataListener = widgetIframeTransport.listenToMessageFromWindow(
      window,
      window.parent,
      WidgetMethodsListen.UPDATE_APP_DATA,
      updateAppDataHandler,
      parentOrigin,
    )
    registerCachedMessageHandler(WidgetMethodsListen.UPDATE_APP_DATA, updateAppDataHandler)

    // Process all cached messages
    getCachedWidgetMessageMethods().forEach((method) => {
      replayCachedWidgetMessage(method)
      clearCachedWidgetMessage(method)
    })

    const parent = window.parent !== window.self ? window.parent : null
    const frameId = window.requestAnimationFrame(() => {
      if (!parent || isReadySentRef.current) return

      isReadySentRef.current = true
      widgetIframeTransport.postMessageToWindow(parent, WidgetMethodsEmit.READY, void 0, parentOrigin)
    })

    return () => {
      window.cancelAnimationFrame(frameId)
      widgetIframeTransport.stopListeningWindowListener(window, updateParamsListener)
      widgetIframeTransport.stopListeningWindowListener(window, updateAppDataListener)
    }
  }, [setHooksEnabled, updateMetaData, navigate, updateParams])

  // Log an error when partnerFee was set and then discarded
  useEffect(() => {
    if (!appCode) return

    if (prevPartnerFee && !partnerFee) {
      const sentryError = Object.assign(
        new Error(`AppCode: ${appCode}, BPS: ${prevPartnerFee.bps}, recipient: ${prevPartnerFee.recipient}`),
        {
          name: 'PartnerFeeDiscarded',
        },
      )

      Sentry.captureException(sentryError, {
        tags: {
          errorType: 'PartnerFeeDiscarded',
        },
      })
    }
  }, [appCode, partnerFee, prevPartnerFee])

  return (
    <>
      <WidgetParamsErrorsScreen errors={validationErrors} />
      <IframeResizer />
    </>
  )
}
