import { ReactNode } from 'react'

import { ALL_SUPPORTED_CHAIN_IDS } from '@cowprotocol/cow-sdk'

import * as styledEl from './styled'

const LOADING_ITEMS_COUNT = ALL_SUPPORTED_CHAIN_IDS.length

const LOADING_SKELETON_INDICES = Array.from({ length: LOADING_ITEMS_COUNT }, (_, index) => index)

export function ChainsLoadingList(): ReactNode {
  return (
    <styledEl.List>
      {LOADING_SKELETON_INDICES.map((index) => (
        <styledEl.LoadingRow key={`chain-skeleton-${index}`}>
          <styledEl.LoadingCircle />
          <styledEl.LoadingBar />
        </styledEl.LoadingRow>
      ))}
    </styledEl.List>
  )
}
