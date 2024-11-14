import { RescueFundsFromProxy } from 'modules/hooksStore/containers/RescueFundsFromProxy'
import { useNavigate } from 'react-router-dom'

export function CowShed() {
  const navigate = useNavigate()

  return (
    <>
      <RescueFundsFromProxy onDismiss={() => navigate(-1)} />
    </>
  )
}
