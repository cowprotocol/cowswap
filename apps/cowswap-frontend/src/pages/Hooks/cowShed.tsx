import { useNavigateBack } from 'common/hooks/useNavigate'

import { RescueFundsFromProxy } from 'modules/hooksStore/containers/RescueFundsFromProxy'

export function CowShed() {
  const navigateBack = useNavigateBack()

  return (
    <>
      <RescueFundsFromProxy onDismiss={navigateBack} />
    </>
  )
}
