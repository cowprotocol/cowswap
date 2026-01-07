/**
 * useHeaderState - Header slot state
 */
import { t } from '@lingui/core/macro'

import { Field } from 'legacy/state/types'

import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'
import { resolveModalTitle } from '../tokenDataHooks'
import { useManageWidgetVisibility } from '../widgetUIState'

export interface HeaderState {
  title: string
  showManageButton: boolean
  onOpenManageWidget: () => void
}

export function useHeaderState(): HeaderState {
  const widgetState = useSelectTokenWidgetState()
  const { openManageWidget } = useManageWidgetVisibility()
  const { standalone } = widgetState
  const resolvedField = widgetState.field ?? Field.INPUT

  const title = resolveModalTitle(resolvedField, widgetState.tradeType) ?? t`Select token`

  return {
    title,
    showManageButton: !standalone,
    onOpenManageWidget: openManageWidget,
  }
}
