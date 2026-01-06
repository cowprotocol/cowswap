/**
 * useHeaderState - Header slot state
 */
import { t } from '@lingui/core/macro'

import { Field } from 'legacy/state/types'

import { useLpTokensWithBalances } from 'modules/yield/shared'

import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'
import { useWidgetMetadata } from '../tokenDataHooks'
import { useManageWidgetVisibility } from '../widgetUIState'

export interface HeaderState {
  title: string
  showManageButton: boolean
  onOpenManageWidget: () => void
}

export function useHeaderState(standalone?: boolean): HeaderState {
  const widgetState = useSelectTokenWidgetState()
  const { openManageWidget } = useManageWidgetVisibility()
  const { count: lpTokensWithBalancesCount } = useLpTokensWithBalances()
  const resolvedField = widgetState.field ?? Field.INPUT

  const { modalTitle } = useWidgetMetadata(
    resolvedField,
    widgetState.tradeType,
    false,
    widgetState.oppositeToken,
    lpTokensWithBalancesCount,
  )

  return {
    title: modalTitle ?? t`Select token`,
    showManageButton: !standalone,
    onOpenManageWidget: openManageWidget,
  }
}
