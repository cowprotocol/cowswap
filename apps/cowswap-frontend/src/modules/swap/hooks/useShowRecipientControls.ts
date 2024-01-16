import { useMemo } from 'react'

import { useIsRecipientToggleVisible } from 'legacy/state/user/hooks'

export function useShowRecipientControls(recipient: string | null): boolean {
  const isRecipientToggleVisible = useIsRecipientToggleVisible()

  return useMemo(() => {
    return isRecipientToggleVisible || !!recipient
  }, [isRecipientToggleVisible, recipient])
}
