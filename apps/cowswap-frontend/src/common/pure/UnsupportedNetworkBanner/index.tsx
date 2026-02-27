import { ReactElement, ReactNode } from 'react'

import { Media, UI } from '@cowprotocol/ui'

import { AlertCircle } from 'react-feather'
import styled from 'styled-components/macro'

const Wrapper = styled.div`
  position: fixed;
  right: 20px;
  top: 100px;
  display: flex;
  background: var(${UI.COLOR_DANGER_BG});
  color: var(${UI.COLOR_DANGER_TEXT});
  backdrop-filter: blur(10px);
  z-index: 30;
  width: 360px;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid var(${UI.COLOR_DANGER});
  box-shadow: var(${UI.BOX_SHADOW});

  ${Media.upToMedium()} {
    left: 10px;
    right: 0;
    width: calc(100vw - 20px);
    bottom: 72px;
    top: initial;
  }
`

const StyledAlertCircle = styled(AlertCircle)`
  color: var(${UI.COLOR_DANGER});
`

interface UnsupportedNetworkBannerProps {
  children: ReactNode
}

export function UnsupportedNetworkBanner({ children }: UnsupportedNetworkBannerProps): ReactElement {
  return (
    <Wrapper role="alert" aria-live="polite">
      <div>
        <StyledAlertCircle size={24} />
      </div>
      <div>{children}</div>
    </Wrapper>
  )
}
