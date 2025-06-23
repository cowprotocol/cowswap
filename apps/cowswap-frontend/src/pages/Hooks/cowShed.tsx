import { ReactNode } from 'react'

import { RecoverFundsFromProxy } from 'modules/cowShed'

import { useNavigateBack } from 'common/hooks/useNavigate'

export function CowShed(): ReactNode {
  const navigateBack = useNavigateBack()

  return (
    <>
      <RecoverFundsFromProxy onDismiss={navigateBack} />
    </>
  )
}
