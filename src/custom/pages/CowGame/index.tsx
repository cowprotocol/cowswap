import React from 'react'
import Page, { Content } from 'components/Page'
import styled from 'styled-components'
import { CowGame } from '@gnosis.pm/cow-runner-game'
import { useWalletInfo } from '@src/custom/hooks/useWalletInfo'

const Wrapper = styled(Page)`
  min-height: initial;

  // Override. Should be addressed in the CowGame package instead.
  .icon-offline {
    display: none;
  }

  h1,
  p {
    text-align: center;
  }

  ${Content} {
    h1 {
      animation: blinker 0.6s cubic-bezier(1, 0, 0, 1) infinite alternate;
    }
  }

  @keyframes blinker {
    to {
      opacity: 0;
    }
  }
`

export default function CowGamePage() {
  const { gnosisSafeInfo } = useWalletInfo()
  return (
    <Wrapper>
      <p>
        <pre>{JSON.stringify(gnosisSafeInfo, null, 2)}</pre>
        Run! ...and try not getting sandwiched{' '}
        <span role="img" aria-label="sandwich-icon">
          🥪
        </span>
        - MEV is lethal these days!
      </p>

      <Content>
        <CowGame />
      </Content>
    </Wrapper>
  )
}
