import React, { useCallback, useState } from 'react'

import ICON_HOOK from '@cowprotocol/assets/cow-swap/hook.svg'
import { BannerOrientation, InlineBanner } from '@cowprotocol/ui'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'


import { SwapWidget } from 'modules/swap'

import { HookRegistryList } from '../HookRegistryList'
import { PostHookButton } from '../PostHookButton'
import { PreHookButton } from '../PreHookButton'
type HookPosition = 'pre' | 'post'

export function HooksStoreWidget() {
  const [selectedHookPosition, setSelectedHookPosition] = useState<HookPosition | null>(null)
  const [hookToEdit, setHookToEdit] = useState<string | undefined>(undefined)

  const onDismiss = useCallback(() => {
    setSelectedHookPosition(null)
    setHookToEdit(undefined)
  }, [])

  const onPreHookEdit = useCallback((uuid: string) => {
    setSelectedHookPosition('pre')
    setHookToEdit(uuid)
  }, [])

  const onPostHookEdit = useCallback((uuid: string) => {
    setSelectedHookPosition('post')
    setHookToEdit(uuid)
  }, [])

  if (selectedHookPosition || hookToEdit) {
    return <HookRegistryList onDismiss={onDismiss} hookToEdit={hookToEdit} isPreHook={selectedHookPosition === 'pre'} />
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
      <PreHookButton onOpen={() => setSelectedHookPosition('pre')} onEditHook={onPreHookEdit} />
    </>
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <SwapWidget
        topContent={TopContent}
        bottomContent={<PostHookButton onOpen={() => setSelectedHookPosition('post')} onEditHook={onPostHookEdit} />}
      />
    </DndProvider>
  )
}
