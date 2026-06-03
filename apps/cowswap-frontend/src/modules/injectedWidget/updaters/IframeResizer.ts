import { useAtomValue } from 'jotai'
import { useLayoutEffect, useRef } from 'react'

import { isIframe, isInjectedWidget } from '@cowprotocol/common-utils'
import { getParentOrigin } from '@cowprotocol/iframe-transport'
import { MEDIA_WIDTHS } from '@cowprotocol/ui'
import { widgetIframeTransport, WidgetMethodsEmit } from '@cowprotocol/widget-lib'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { openModalState } from 'common/state/openModalState'

export function IframeResizer(): null {
  const isModalOpen = useAtomValue(openModalState)
  const previousHeightRef = useRef(0)
  const { disableScrollbars } = useInjectedWidgetParams()

  useLayoutEffect(() => {
    const parentOrigin = getParentOrigin()

    if (!shouldPropagateHeightUpdates(parentOrigin)) return

    if (disableScrollbars) {
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.documentElement.style.removeProperty('overflow')
    }
  }, [disableScrollbars])

  useLayoutEffect(() => {
    const parentOrigin = getParentOrigin()

    if (!shouldPropagateHeightUpdates(parentOrigin)) return

    const contentElement = getContentElement(document)

    const sendHeightUpdate = (): void => {
      const contentHeight = getContentHeight(contentElement)

      if (isModalOpen) {
        const isUpToSmall = document.body.offsetWidth <= MEDIA_WIDTHS.upToSmall

        widgetIframeTransport.postMessageToWindow(
          window.parent,
          WidgetMethodsEmit.SET_FULL_HEIGHT,
          { isUpToSmall },
          parentOrigin,
        )

        previousHeightRef.current = 0
        return
      }

      if (contentHeight !== previousHeightRef.current) {
        widgetIframeTransport.postMessageToWindow(
          window.parent,
          WidgetMethodsEmit.UPDATE_HEIGHT,
          {
            height: contentHeight,
          },
          parentOrigin,
        )
        previousHeightRef.current = contentHeight
      }
    }
    sendHeightUpdate()

    window.addEventListener('resize', sendHeightUpdate)

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            sendHeightUpdate()
          })
        : null

    resizeObserver?.observe(contentElement)

    if (contentElement !== document.body) {
      resizeObserver?.observe(document.body)
    }

    const mutationObserver =
      !resizeObserver && typeof MutationObserver !== 'undefined'
        ? new MutationObserver(() => {
            sendHeightUpdate()
          })
        : null

    mutationObserver?.observe(document.body, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    })

    return () => {
      window.removeEventListener('resize', sendHeightUpdate)
      resizeObserver?.disconnect()
      mutationObserver?.disconnect()
    }
  }, [isModalOpen])

  return null
}

function shouldPropagateHeightUpdates(parentOrigin: string | null | undefined): parentOrigin is string {
  return isIframe() && isInjectedWidget() && Boolean(parentOrigin)
}

function getContentElement(doc: Document): HTMLElement {
  return doc.getElementById('root') ?? doc.body
}

function getContentHeight(contentElement: HTMLElement): number {
  return Math.max(
    contentElement.offsetHeight,
    contentElement.clientHeight,
    Math.ceil(contentElement.getBoundingClientRect().height),
  )
}
