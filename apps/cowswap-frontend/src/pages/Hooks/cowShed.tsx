import { RescueFundsFromProxy } from 'modules/hooksStore/containers/RescueFundsFromProxy'

import { useNavigateBack } from 'common/hooks/useNavigate'


export function CowShed() {
  const navigateBack = useNavigateBack()

  return (
    <>
      <RescueFundsFromProxy onDismiss={navigateBack} />
    </>
  )
}
