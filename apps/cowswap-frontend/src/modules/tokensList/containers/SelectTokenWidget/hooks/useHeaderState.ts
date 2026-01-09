import { t } from '@lingui/core/macro'

import { Field } from 'legacy/state/types'

import { useManageWidgetVisibility } from './useManageWidgetVisibility'
import { resolveModalTitle } from './useWidgetMetadata'

import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'

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
