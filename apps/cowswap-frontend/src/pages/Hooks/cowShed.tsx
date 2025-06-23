import { ReactNode } from 'react'

import { CoWShedWidget } from 'modules/cowShed'

import { useNavigateBack } from 'common/hooks/useNavigate'

export function CowShed(): ReactNode {
  const navigateBack = useNavigateBack()

  return (
    <>
      <CoWShedWidget onDismiss={navigateBack} />
    </>
  )
}
