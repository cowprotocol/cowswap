import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { isPartialApproveEnabledAtom } from '../../state/isPartialApproveEnabledAtom'

interface Erc20ApproveProps {
  isPartialApprovalEnabled: boolean
}

export function Erc20ApproveWidget({ isPartialApprovalEnabled }: Erc20ApproveProps): null {
  const setIsPartialApproveEnabled = useSetAtom(isPartialApproveEnabledAtom)

  useEffect(() => {
    setIsPartialApproveEnabled(isPartialApprovalEnabled)
  }, [setIsPartialApproveEnabled, isPartialApprovalEnabled])

  return null
}
