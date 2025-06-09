import { RecoverFundsFromProxy } from 'modules/hooksStore/containers/RecoverFundsFromProxy'

import { useNavigateBack } from 'common/hooks/useNavigate'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CowShed() {
  const navigateBack = useNavigateBack()

  return (
    <>
      <RecoverFundsFromProxy onDismiss={navigateBack} />
    </>
  )
}
