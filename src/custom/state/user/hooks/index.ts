import { useCallback } from 'react'
import { useAppDispatch } from 'state/hooks'
import { toggleURLWarning } from 'state/user/actions'

export * from '@src/state/user/hooks'

export function useURLWarningToggle(): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(toggleURLWarning()), [dispatch])
}
