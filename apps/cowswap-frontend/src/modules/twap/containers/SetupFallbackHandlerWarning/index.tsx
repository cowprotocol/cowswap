import { ButtonPrimary, InlineBanner } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { useSetupFallbackHandler } from '../../hooks/useSetupFallbackHandler'

const Banner = styled(InlineBanner)`
  margin-bottom: 20px;
`

const ActionButton = styled(ButtonPrimary)`
  display: inline-block;
  width: auto;
  font-size: 15px;
  padding: 16px 24px;
  min-height: auto;
`

export function SetupFallbackHandlerWarning() {
  const setupFallbackHandler = useSetupFallbackHandler()

  return (
    <Banner bannerType="danger">
      <p>
        Your Safe fallback handler was changed after TWAP orders ware placed. All open TWAP orders are not getting
        created because of that. Please, update the fallback handler in order to make the orders work again.
      </p>
      <ActionButton onClick={setupFallbackHandler}>Update fallback handler</ActionButton>
    </Banner>
  )
}
