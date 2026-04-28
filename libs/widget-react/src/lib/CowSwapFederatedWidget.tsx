import { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { CowSwapWidgetProps, sanitizeWidgetBaseUrl } from '@cowprotocol/widget-lib'

import { CowSwapFederatedWidgetHandle, CowSwapFederatedWidgetRemote } from './federationTypes'

const REMOTE_MODULE = './CowSwapWidgetRemote'
const REMOTE_ENTRY_PATH = '/remoteEntry.js'

export interface CowSwapFederatedWidgetProps extends CowSwapWidgetProps {
  remoteEntryUrl?: string
}

interface ViteFederationRemoteEntry {
  init(sharedScope: Record<string, unknown>): void | Promise<void>
  get(exposedModule: string): Promise<() => unknown>
}

export function CowSwapFederatedWidget(props: CowSwapFederatedWidgetProps): JSX.Element {
  const [error, setError] = useState<{ error: Error; message: string } | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const handleRef = useRef<CowSwapFederatedWidgetHandle | null>(null)
  const propsRef = useRef(props)

  // eslint-disable-next-line react-hooks/refs
  propsRef.current = props

  const remoteEntryUrl = useMemo(() => {
    return props.remoteEntryUrl ?? sanitizeWidgetBaseUrl(props.params.baseUrl) + REMOTE_ENTRY_PATH
  }, [props.params.baseUrl, props.remoteEntryUrl])

  const handleError = useCallback((message: string, cause: unknown) => {
    const error = cause instanceof Error ? cause : new Error('Unknown CowSwapWidget federation error', { cause })

    console.error(`[WIDGET] ${message}`, error)
    setError({ message, error })
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (container === null) return
    const widgetContainer: HTMLElement = container

    let cancelled = false

    async function loadRemoteWidget(): Promise<void> {
      try {
        const remote = await loadFederatedRemote(remoteEntryUrl)

        if (cancelled) return

        handleRef.current = remote.mount(widgetContainer, propsRef.current)
      } catch (err) {
        if (!cancelled) {
          handleError('Error loading federated CoW Swap widget', err)
        }
      }
    }

    loadRemoteWidget()

    return () => {
      cancelled = true
      handleRef.current?.unmount()
      handleRef.current = null
    }
  }, [handleError, remoteEntryUrl])

  useEffect(() => {
    handleRef.current?.update(props)
  }, [props])

  if (error) {
    return (
      <div style={{ color: '#ff3a3a' }}>
        {error.message}
        {error.error.message && <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75em' }}>{error.error.message}</pre>}
      </div>
    )
  }

  return <div ref={containerRef} style={{ width: '100%' }} />
}

async function loadFederatedRemote(remoteEntryUrl: string): Promise<CowSwapFederatedWidgetRemote> {
  const remoteEntry = (await import(/* @vite-ignore */ remoteEntryUrl)) as ViteFederationRemoteEntry

  await remoteEntry.init({})

  const moduleFactory = await remoteEntry.get(REMOTE_MODULE)
  const module = moduleFactory()

  return resolveRemoteModule(module)
}

function resolveRemoteModule(module: unknown): CowSwapFederatedWidgetRemote {
  if (isCowSwapFederatedWidgetRemote(module)) return module

  if (isRemoteModuleWithDefault(module) && isCowSwapFederatedWidgetRemote(module.default)) {
    return module.default
  }

  throw new Error('Invalid CoW Swap widget remote module')
}

function isRemoteModuleWithDefault(module: unknown): module is { default: unknown } {
  return typeof module === 'object' && module !== null && 'default' in module
}

function isCowSwapFederatedWidgetRemote(module: unknown): module is CowSwapFederatedWidgetRemote {
  return typeof module === 'object' && module !== null && 'mount' in module && typeof module.mount === 'function'
}
