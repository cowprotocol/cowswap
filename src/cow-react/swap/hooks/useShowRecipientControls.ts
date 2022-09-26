import { useWrapType, WrapType } from 'hooks/useWrapCallback'
import { useExpertModeManager, useIsRecipientToggleVisible } from 'state/user/hooks'
import { useMemo } from 'react'

export function useShowRecipientControls(): boolean {
  const wrapType = useWrapType()
  const isWrapUnwrap = wrapType !== WrapType.NOT_APPLICABLE
  const [isExpertMode] = useExpertModeManager()
  const isRecipientToggleVisible = useIsRecipientToggleVisible()

  return useMemo(() => {
    return !isWrapUnwrap && (isExpertMode || isRecipientToggleVisible)
  }, [isWrapUnwrap, isExpertMode, isRecipientToggleVisible])
}
