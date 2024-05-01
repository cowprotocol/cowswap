
import { ButtonPrimary, ButtonSize, HoverTooltip } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { HelpCircle } from 'react-feather'
import styled from 'styled-components/macro'

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const TooltipWrapper = styled(HoverTooltip)`
  width: 100%;
  color: red !important;
  z-index: 9876;
`

export function SafeReadOnlyButton() {
  return (
      <TooltipWrapper wrapInContainer
          content={
            <div>
              Your Safe is not connected with a signer.
              <br />
              To place an order, you must connect using a signer of the Safe and refresh the page.
            </div>
          }
        >          
        <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG} title="Connect signer">
          <Container>
              <Trans>Connect signer</Trans>
              <HelpCircle size={18} />
            </Container>        
        </ButtonPrimary>
      </TooltipWrapper>
  )
}
