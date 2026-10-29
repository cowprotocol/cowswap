import { useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { Field } from 'legacy/state/types'

import { useManageWidgetVisibility } from './useManageWidgetVisibility'
import { resolveModalTitle } from './useWidgetMetadata'

import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'
import { getTokenSelectorFilter } from '../../../utils/filterTokensForSelector'

export interface HeaderState {
  title: string
  showManageButton: boolean
  onOpenManageWidget: () => void
}

export function useHeaderState(): HeaderState {
  const widgetState = useSelectTokenWidgetState()
  const { openManageWidget } = useManageWidgetVisibility()
  const widgetParams = useInjectedWidgetParams()
  const { disableTokenImport } = widgetParams
  const { standalone } = widgetState
  const resolvedField = widgetState.field ?? Field.INPUT
  const hasFixedTokens = Boolean(getTokenSelectorFilter(widgetState.field, widgetParams)?.tokens)

  const title = resolveModalTitle(resolvedField, widgetState.tradeType) ?? t`Select token`

  return useMemo(
    () => ({
      title,
      showManageButton: !standalone && !disableTokenImport && !hasFixedTokens,
      onOpenManageWidget: openManageWidget,
    }),
    [title, standalone, disableTokenImport, hasFixedTokens, openManageWidget],
  )
}
