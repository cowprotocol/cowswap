import { useCallback, useMemo } from 'react'
import { useAppDispatch } from 'state/hooks'
import { toggleURLWarning } from 'state/user/actions'
import { calculateValidTo } from 'hooks/useSwapCallback'
import { useUserTransactionTTL } from '@src/state/user/hooks'

export * from '@src/state/user/hooks'

export function useURLWarningToggle(): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(toggleURLWarning()), [dispatch])
}

export function useOrderValidTo() {
  const [deadline] = useUserTransactionTTL()
  return useMemo(() => ({ validTo: calculateValidTo(deadline), deadline }), [deadline])
}
