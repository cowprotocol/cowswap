import { ReactNode } from 'react'

import { Search } from './Search'

import { useSearchState } from '../../hooks'

export function ConnectedSearch(): ReactNode {
  const onPressEnter = useSearchState()
  return <Search onPressEnter={onPressEnter} />
}
