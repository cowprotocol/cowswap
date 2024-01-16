import { COW_PROTOCOL_LINK } from '@cowprotocol/common-const'
import { ExternalLink } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import cowIcon from 'assets/logo/cow-icon.svg'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  font-size: var(${UI.FONT_SIZE_SMALLER});
  padding: 4px 0;
`

const StyledExternalLink = styled(ExternalLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: inherit;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  opacity: 0.5;

  &:hover {
    color: inherit;
    opacity: 1;
  }

  > svg {
    --size: 14px;
    width: var(--size);
    height: var(--size);
    color: inherit;
  }

  > svg > g > path {
    fill: currentColor;
  }
`

export function PoweredFooter() {
  return (
    <Wrapper>
      <StyledExternalLink href={COW_PROTOCOL_LINK}>
        <SVG src={cowIcon} title="CoW Protocol" />
        <Trans>Powered by CoW Protocol</Trans>
      </StyledExternalLink>
    </Wrapper>
  )
}
