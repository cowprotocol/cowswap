import { UI } from '@cowprotocol/ui'
import { InlineBanner } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
  width: 100%;
`

const StyledBanner = styled(InlineBanner)`
  width: 100%;

  > span {
    flex-flow: row nowrap;
    width: 100%;
  }
`

const AcceptButton = styled.button`
  background: var(${UI.COLOR_PRIMARY});
  color: var(${UI.COLOR_BUTTON_TEXT});
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  border: none;
  box-shadow: none;
  outline: none;
  padding: 10px 20px;
  border-radius: 8px;
  margin: 0 0 0 auto;

  &:hover {
    background: var(${UI.COLOR_PRIMARY_LIGHTER});
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function PriceUpdatedBanner({ onClick }: { onClick(): void }) {
  return (
    <StyledBanner>
      <Wrapper>
        <div>
          <Trans>Price Updated</Trans>
        </div>
        <div>
          <AcceptButton onClick={onClick}>
            <Trans>Accept</Trans>
          </AcceptButton>
        </div>
      </Wrapper>
    </StyledBanner>
  )
}
