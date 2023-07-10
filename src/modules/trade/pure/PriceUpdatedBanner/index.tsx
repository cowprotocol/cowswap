import React from 'react'

import { Trans } from '@lingui/macro'
import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import { InlineBanner } from 'common/pure/InlineBanner'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
  width: 100%;
`

const StyledBanner = styled(InlineBanner)`
  > span {
    flex-flow: row nowrap;
  }
`

const AcceptButton = styled.button`
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.white};
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
    background-color: ${({ theme }) => transparentize(0.2, theme.bg2)};
  }
`

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
