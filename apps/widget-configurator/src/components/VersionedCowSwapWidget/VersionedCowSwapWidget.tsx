import { ReactNode, Suspense, useEffect, useRef } from 'react'

import type { CowWidgetEventListeners } from '@cowprotocol/events'
import type { CowSwapWidgetParams, CowSwapWidgetProps } from '@cowprotocol/widget-lib'
import { CowSwapWidget } from '@cowprotocol/widget-react'

import { LAZY_WIDGETS_BY_VERSION } from '../../utils/widget-sdk-versions/widget-sdk-versions.loaders'
import { widgetSdkVersionSupportsReadyEvent } from '../../utils/widget-sdk-versions/widget-sdk-versions.utils'

import type { WidgetSdkVersion } from '../../utils/widget-sdk-versions/widget-sdk-versions.constants'

type PinnedWidgetSdkVersion = Exclude<WidgetSdkVersion, 'local'>

export interface VersionedCowSwapWidgetProps {
  sdkVersion: WidgetSdkVersion
  params: CowSwapWidgetParams
  provider?: CowSwapWidgetProps['provider']
  listeners?: CowWidgetEventListeners
  onReady?: () => void
}

function attachIframeLoadReveal(host: HTMLElement, onIframeLoad: () => void): void {
  const iframe = host.querySelector('iframe')
  if (!iframe) return

  iframe.addEventListener('load', onIframeLoad, { once: true })
}

/**
 * Mounts inside Suspense after the pinned chunk loads, so CowSwapWidget's effect has already
 * appended the iframe — no MutationObserver needed.
 */
function LegacyPinnedPreviewReveal({
  onIframeLoad,
  children,
}: {
  onIframeLoad?: () => void
  children: ReactNode
}): ReactNode {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!onIframeLoad) return

    const host = hostRef.current
    if (!host) return

    attachIframeLoadReveal(host, onIframeLoad)
  }, [onIframeLoad])

  return (
    <div ref={hostRef} style={{ width: '100%' }}>
      {children}
    </div>
  )
}

function LazyPinnedCowSwapWidget({
  sdkVersion,
  params,
  provider,
  listeners,
  onReady,
}: VersionedCowSwapWidgetProps & { sdkVersion: PinnedWidgetSdkVersion }): ReactNode {
  const LazyCowSwapWidget = LAZY_WIDGETS_BY_VERSION[sdkVersion]
  const legacyIframeLoadReveal = widgetSdkVersionSupportsReadyEvent(sdkVersion) ? undefined : onReady

  return (
    <Suspense fallback={null}>
      <LegacyPinnedPreviewReveal onIframeLoad={legacyIframeLoadReveal}>
        <LazyCowSwapWidget params={params} provider={provider} listeners={listeners} onReady={onReady} />
      </LegacyPinnedPreviewReveal>
    </Suspense>
  )
}

export function VersionedCowSwapWidget({
  sdkVersion,
  params,
  provider,
  listeners,
  onReady,
}: VersionedCowSwapWidgetProps): ReactNode {
  const widgetProps = { params, provider, listeners, onReady }

  if (sdkVersion === 'local') {
    return <CowSwapWidget {...widgetProps} />
  }

  return <LazyPinnedCowSwapWidget sdkVersion={sdkVersion} {...widgetProps} />
}
