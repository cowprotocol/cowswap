import { ReactNode } from 'react'

import { Search } from './Search'

import { useSelectTokenWidgetState } from '../../../../hooks/useSelectTokenWidgetState'

export function ConnectedSearch(): ReactNode {
  const { onInputPressEnter } = useSelectTokenWidgetState()

  return <Search onPressEnter={onInputPressEnter} />
}
