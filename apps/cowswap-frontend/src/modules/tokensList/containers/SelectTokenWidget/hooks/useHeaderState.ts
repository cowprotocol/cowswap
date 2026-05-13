import { useMemo } from 'react'

import { t } from '@lingui/core/macro'

import { Field } from 'legacy/state/types'

import { useInjectedWidgetParams } from 'modules/injectedWidget'

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
  const { disableTokenImport } = useInjectedWidgetParams()
  const { standalone } = widgetState
  const resolvedField = widgetState.field ?? Field.INPUT

  const title = resolveModalTitle(resolvedField, widgetState.tradeType) ?? t`Select token`

  return useMemo(
    () => ({
      title,
      showManageButton: !standalone && !disableTokenImport,
      onOpenManageWidget: openManageWidget,
    }),
    [title, standalone, disableTokenImport, openManageWidget],
  )
}
