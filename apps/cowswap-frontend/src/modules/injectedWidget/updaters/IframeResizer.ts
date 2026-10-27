import { useAtomValue } from 'jotai'
import { useLayoutEffect, useRef } from 'react'

import { isIframe, isInjectedWidget } from '@cowprotocol/common-utils'
import { getParentOrigin } from '@cowprotocol/iframe-transport'
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
    }

    return () => {
      document.documentElement.style.removeProperty('overflow')
    }
  }, [disableScrollbars])

  useLayoutEffect(() => {
    const parentOrigin = getParentOrigin()

    if (!shouldPropagateHeightUpdates(parentOrigin)) return

    const contentElement = getContentElement(document)
    const modalElements = isModalOpen ? getModalContentElements(document) : []

    const sendHeightUpdate = (): void => {
      if (isModalOpen && !modalElements.length) {
        widgetIframeTransport.postMessageToWindow(
          window.parent,
          WidgetMethodsEmit.SET_FULL_HEIGHT,
          void 0,
          parentOrigin,
        )

        previousHeightRef.current = 0
        return
      }

      const contentHeight = Math.max(
        getContentHeight(contentElement),
        ...modalElements.map((modalElement) => Math.max(modalElement.offsetHeight, modalElement.scrollHeight)),
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
  }, [isModalOpen])

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

// Legacy modals render in a portal outside #root, so their height has to be measured separately
function getModalContentElements(doc: Document): HTMLElement[] {
  return Array.from(doc.querySelectorAll<HTMLElement>('[data-reach-dialog-content]'))
}

function shouldPropagateHeightUpdates(parentOrigin: string | null | undefined): boolean {
  return isIframe() && isInjectedWidget() && Boolean(parentOrigin)
}
