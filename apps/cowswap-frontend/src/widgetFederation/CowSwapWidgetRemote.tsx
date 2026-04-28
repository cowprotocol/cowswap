import { createElement, ReactElement } from 'react'

import { setInjectedWidgetMode } from '@cowprotocol/common-utils'
import type { CowSwapWidgetProps } from '@cowprotocol/widget-lib'

import reachDialogStyles from '@reach/dialog/styles.css?inline'
import { createRoot } from 'react-dom/client'
import { StyleSheetManager } from 'styled-components/macro'

import widgetFontsStyles from '../styles/fonts.css?inline'

setInjectedWidgetMode(true)

const ERROR_COLOR = '#ff3a3a'
const WIDGET_STYLES_ELEMENT_ID = 'cow-swap-widget-federated-styles'
const WIDGET_ROOT_ATTRIBUTE = 'data-cow-swap-widget-root'

interface CowSwapFederatedWidgetHandle {
  update(props: CowSwapWidgetProps): void
  unmount(): void
}

interface FederatedWidgetAppModule {
  CowSwapWidgetFederatedApp(
    props: CowSwapWidgetProps & {
      localeMessages: Awaited<ReturnType<FederatedWidgetAppModule['loadFederatedWidgetLocaleMessages']>>
    },
  ): ReactElement
  loadFederatedWidgetLocaleMessages(): Promise<unknown>
  setFederatedWidgetParams(params: CowSwapWidgetProps['params']): void
}

let federatedWidgetAppModulePromise: Promise<FederatedWidgetAppModule> | null = null

function loadFederatedWidgetApp(): Promise<FederatedWidgetAppModule> {
  if (!federatedWidgetAppModulePromise) {
    federatedWidgetAppModulePromise = import('./CowSwapWidgetFederatedApp')
  }

  return federatedWidgetAppModulePromise
}

export function mount(container: HTMLElement, props: CowSwapWidgetProps): CowSwapFederatedWidgetHandle {
  const { rootContainer, shadowRoot } = createWidgetShadowRoot(container)
  const root = createRoot(rootContainer)
  let currentProps = props
  let renderId = 0
  let isUnmounted = false
  let isReadySent = false

  async function render(): Promise<void> {
    const currentRenderId = ++renderId
    const renderedProps = currentProps
    const { CowSwapWidgetFederatedApp, loadFederatedWidgetLocaleMessages, setFederatedWidgetParams } =
      await loadFederatedWidgetApp()
    const localeMessages = await loadFederatedWidgetLocaleMessages()

    if (isUnmounted || currentRenderId !== renderId) return

    setFederatedWidgetParams(renderedProps.params)
    root.render(
      createElement(
        StyleSheetManager,
        { target: shadowRoot },
        createElement(CowSwapWidgetFederatedApp, { ...renderedProps, localeMessages }),
      ),
    )

    if (!isReadySent) {
      isReadySent = true
      renderedProps.onReady?.()
    }
  }

  render().catch(renderError)

  return {
    update(nextProps: CowSwapWidgetProps) {
      currentProps = nextProps
      render().catch(renderError)
    },
    unmount() {
      isUnmounted = true
      root.unmount()
      rootContainer.remove()
    },
  }

  function renderError(error: unknown): void {
    console.error('[WIDGET] Error rendering federated CoW Swap widget', error)

    if (isUnmounted) return

    const message = error instanceof Error ? error.message : 'Unknown federated CoW Swap widget error'

    root.render(createElement('div', { style: { color: ERROR_COLOR } }, message))
  }
}

function createWidgetShadowRoot(container: HTMLElement): { rootContainer: HTMLElement; shadowRoot: ShadowRoot } {
  const shadowRoot = container.shadowRoot || container.attachShadow({ mode: 'open' })
  const styleElement = shadowRoot.getElementById(WIDGET_STYLES_ELEMENT_ID) || document.createElement('style')

  styleElement.id = WIDGET_STYLES_ELEMENT_ID
  styleElement.textContent = `
    :host {
      all: initial;
      display: block;
      width: 100%;
      height: 100%;
      font-family: "Inter var", Inter, sans-serif;
    }

    ${widgetFontsStyles}
    ${reachDialogStyles}
  `

  if (!styleElement.parentNode) {
    shadowRoot.appendChild(styleElement)
  }

  const rootContainer = document.createElement('div')

  rootContainer.setAttribute(WIDGET_ROOT_ATTRIBUTE, '')
  shadowRoot.appendChild(rootContainer)

  return { rootContainer, shadowRoot }
}

const remote = { mount }

export default remote
