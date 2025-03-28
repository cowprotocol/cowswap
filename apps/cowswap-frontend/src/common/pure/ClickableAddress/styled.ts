import { Opacity, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { LinkStyledButton } from 'theme'

export const Wrapper = styled.div<{ openTooltip: boolean; alwaysShow: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;

  &:hover {
    > button {
      opacity: ${Opacity.medium};
    }
  }

  > button {
    opacity: ${({ openTooltip, alwaysShow }) => {
      if (alwaysShow) return Opacity.medium

      return openTooltip ? Opacity.full : Opacity.none
    }};

    &:hover {
      opacity: ${Opacity.full};
    }
  }
`

export const AddressWrapper = styled.span`
  margin: 0;
  line-height: 1;
  font-size: 13px;
  font-weight: 400;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
`

export const InfoIcon = styled(LinkStyledButton)`
  --iconSize: var(${UI.ICON_SIZE_TINY});
  color: inherit;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 0.825rem;
  border-radius: 50%;
  background-color: transparent;
  min-width: var(--iconSize);
  min-height: var(--iconSize);
  align-self: flex-end;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  > div {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover,
  &:active,
  &:focus {
    text-decoration: none;
    color: inherit;
  }
`
