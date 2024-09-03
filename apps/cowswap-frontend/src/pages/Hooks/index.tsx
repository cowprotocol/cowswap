import React from 'react'

import { PostHookButton, PreHookButton } from 'modules/hooksStore'
import { SwapUpdaters } from 'modules/swap'
import { SwapWidget } from 'modules/swap'

export function HooksPage() {
  return (
    <>
      <SwapUpdaters />
      <SwapWidget topContent={<PreHookButton />} bottomContent={<PostHookButton />} />
    </>
  )
}
