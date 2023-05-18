import { useWrapType, WrapType } from 'hooks/useWrapCallback'
import { useIsRecipientToggleVisible } from 'state/user/hooks'
import { useMemo } from 'react'

export function useShowRecipientControls(recipient: string | null): boolean {
  const wrapType = useWrapType()
  const isWrapUnwrap = wrapType !== WrapType.NOT_APPLICABLE
  const isRecipientToggleVisible = useIsRecipientToggleVisible()

  return useMemo(() => {
    return !isWrapUnwrap && (isRecipientToggleVisible || !!recipient)
  }, [isWrapUnwrap, isRecipientToggleVisible, recipient])
}
