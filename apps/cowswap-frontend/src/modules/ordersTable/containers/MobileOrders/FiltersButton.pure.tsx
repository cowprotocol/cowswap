import { ReactNode } from 'react'

import { useLingui } from '@lingui/react/macro'

import * as styledEl from './MobileOrders.styled'

export interface FiltersButtonProps {
  activeCount: number
  onClick(): void
}

export function FiltersButton({ activeCount, onClick }: FiltersButtonProps): ReactNode {
  const { t } = useLingui()

  return (
    <styledEl.FilterButton type="button" aria-label={t`Search and filter orders`} onClick={onClick}>
      {activeCount > 0 ? t`Filters (${activeCount})` : t`Filters`}
    </styledEl.FilterButton>
  )
}
