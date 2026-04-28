import { createElement, ReactElement } from 'react'

import { setInjectedWidgetMode } from '@cowprotocol/common-utils'
import type { CowSwapWidgetProps } from '@cowprotocol/widget-lib'

import { createRoot } from 'react-dom/client'

setInjectedWidgetMode(true)

const ERROR_COLOR = '#ff3a3a'

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
  const root = createRoot(container)
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
    root.render(createElement(CowSwapWidgetFederatedApp, { ...renderedProps, localeMessages }))

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
    },
  }

  function renderError(error: unknown): void {
    console.error('[WIDGET] Error rendering federated CoW Swap widget', error)

    if (isUnmounted) return

    const message = error instanceof Error ? error.message : 'Unknown federated CoW Swap widget error'

    root.render(createElement('div', { style: { color: ERROR_COLOR } }, message))
  }
}

const remote = { mount }

export default remote
