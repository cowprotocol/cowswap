import { Trans } from '@lingui/react/macro'
import { ReactNode } from 'react'

import * as styledEl from './ShowOnlyFilledOrdersFilter.styled'

interface ShowOnlyFilledOrdersFilterProps {
  showOnlyFilled: boolean
  onShowOnlyFilledChange: (showOnlyFilled: boolean) => void
}

export function ShowOnlyFilledOrdersFilter({
  showOnlyFilled,
  onShowOnlyFilledChange,
}: ShowOnlyFilledOrdersFilterProps): ReactNode {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onShowOnlyFilledChange(e.target.checked)
  }

  return (
    <styledEl.FilterContainer>
      <styledEl.Checkbox type="checkbox" checked={showOnlyFilled} onChange={handleChange} />
      <styledEl.Label htmlFor="show-only-filled">
        <Trans>Show only filled orders</Trans>
      </styledEl.Label>
    </styledEl.FilterContainer>
  )
}
