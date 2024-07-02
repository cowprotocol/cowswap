import { ButtonPrimary, ButtonSize, HelpTooltip } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export function SafeReadOnlyButton() {
  return (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG} title="Connect signer">
      <Container>
        <Trans>Connect signer</Trans>
        <HelpTooltip
          text={
            <div>
              Your Safe is not connected with a signer.
              <br />
              To place an order, you must connect using a signer of this Safe.
            </div>
          }
        />
      </Container>
    </ButtonPrimary>
  )
}
