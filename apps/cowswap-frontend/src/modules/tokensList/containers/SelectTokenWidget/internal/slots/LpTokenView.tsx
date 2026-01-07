/**
 * LpTokenView Slot - Modal for LP token details
 */
import { ReactNode } from 'react'

import { LpTokenPage } from '../../../LpTokenPage'
import { useLpTokenViewState } from '../../hooks'

export function LpTokenView(): ReactNode {
  const state = useLpTokenViewState()

  if (!state) return null

  return (
    <LpTokenPage
      poolAddress={state.poolAddress}
      onDismiss={state.onDismiss}
      onBack={state.onBack}
      onSelectToken={state.onSelectToken}
    />
  )
}
