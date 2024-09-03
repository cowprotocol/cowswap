import React, { useState } from 'react'

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

  return (
    <SwapWidget
      topContent={<PreHookButton onOpen={() => setSelectedHookPosition('pre')} />}
      bottomContent={<PostHookButton onOpen={() => setSelectedHookPosition('post')} />}
    />
  )
}
