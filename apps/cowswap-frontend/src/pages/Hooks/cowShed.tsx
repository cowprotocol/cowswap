import { RecoverFundsFromProxy } from 'modules/hooksStore/containers/RecoverFundsFromProxy'

import { useNavigateBack } from 'common/hooks/useNavigate'

export function CowShed() {
  const navigateBack = useNavigateBack()

  return (
    <>
      <RecoverFundsFromProxy onDismiss={navigateBack} />
    </>
  )
}
