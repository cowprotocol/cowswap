import { useMemo } from 'react'
import { useDeadline } from '../containers/DeadlineSelector/hooks/useDeadline'
import { useNoOfParts } from './useParts'

export function useSinglePartTime() {
  const deadline = useDeadline()
  const noOfParts = useNoOfParts()

  return useMemo(() => {
    console.log(deadline, noOfParts)
    return 'Todo part time'
  }, [deadline, noOfParts])
}
