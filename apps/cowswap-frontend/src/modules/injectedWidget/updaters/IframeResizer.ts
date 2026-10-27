import { useAtomValue } from 'jotai'
import { useLayoutEffect, useRef } from 'react'

import { isIframe, isInjectedWidget } from '@cowprotocol/common-utils'
import { getParentOrigin } from '@cowprotocol/iframe-transport'
import { widgetIframeTransport, WidgetMethodsEmit } from '@cowprotocol/widget-lib'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { openModalElementsState } from 'common/state/openModalState'

export function IframeResizer(): null {
  const modalElements = useAtomValue(openModalElementsState)
  const previousHeightRef = useRef(0)
  const { disableScrollbars } = useInjectedWidgetParams()

  useLayoutEffect(() => {
    const parentOrigin = getParentOrigin()

    if (!shouldPropagateHeightUpdates(parentOrigin)) return

    if (disableScrollbars) {
      document.documentElement.style.overflow = 'hidden'
    }

    return () => {
      document.documentElement.style.removeProperty('overflow')
    }
  }, [disableScrollbars])

  useLayoutEffect(() => {
    const parentOrigin = getParentOrigin()

    if (!shouldPropagateHeightUpdates(parentOrigin)) return

    const contentElement = getContentElement(document)

    const sendHeightUpdate = (): void => {
      // Legacy modals render in a portal outside #root, so they are measured separately
      const contentHeight = Math.max(
        getContentHeight(contentElement),
        ...modalElements.map((modalElement) => modalElement.offsetHeight),
      )

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

    modalElements.forEach((modalElement) => resizeObserver?.observe(modalElement))

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
  }, [modalElements])

  return null
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

function shouldPropagateHeightUpdates(parentOrigin: string | null | undefined): boolean {
  return isIframe() && isInjectedWidget() && Boolean(parentOrigin)
}
