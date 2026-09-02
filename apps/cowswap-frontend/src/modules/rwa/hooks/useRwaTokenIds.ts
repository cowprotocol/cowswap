import { useMemo } from 'react'

import { useAllListsList } from '@cowprotocol/tokens'

import { getRwaTokenIds } from '../utils/getRwaTokenIds'

export function useRwaTokenIds(): ReadonlySet<string> {
  const lists = useAllListsList()

  return useMemo(() => getRwaTokenIds(lists), [lists])
}
