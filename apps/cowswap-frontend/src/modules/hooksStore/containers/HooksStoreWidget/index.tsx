import React, { useState } from 'react'

import ICON_HOOK from '@cowprotocol/assets/cow-swap/hook.svg'
import { BannerOrientation, InlineBanner } from '@cowprotocol/ui'

import { SwapWidget } from 'modules/swap'

import { HookRegistryList } from '../HookRegistryList'
import { PostHookButton } from '../PostHookButton'
import { PreHookButton } from '../PreHookButton'
type HookPosition = 'pre' | 'post'

export function HooksStoreWidget() {
  const [selectedHookPosition, setSelectedHookPosition] = useState<HookPosition | null>(null)

  if (selectedHookPosition) {
    return (
      <HookRegistryList onDismiss={() => setSelectedHookPosition(null)} isPreHook={selectedHookPosition === 'pre'} />
    )
  }

  const TopContent = (
    <>
      <InlineBanner orientation={BannerOrientation.Horizontal} customIcon={ICON_HOOK} iconSize={36} bannerId="hooks-store-banner-tradeContainer" isDismissable>
        <p>
          With hooks you can add specific actions <b>before</b> and <b>after</b> your swap.{' '}
          <a href="https://docs.cow.fi/cow-protocol/reference/sdks/cow-sdk" target="_blank" rel="noopener noreferrer">
            Learn more.
          </a>
        </p>
      </InlineBanner>
      <PreHookButton onOpen={() => setSelectedHookPosition('pre')} />
    </>
  )

  return (
    <SwapWidget
      topContent={TopContent}
      bottomContent={<PostHookButton onOpen={() => setSelectedHookPosition('post')} />}
    />
  )
}
