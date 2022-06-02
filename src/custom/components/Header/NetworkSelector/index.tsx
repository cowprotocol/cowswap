import styled from 'styled-components/macro'
import NetworkSelectorMod, { SelectorLabel, SelectorControls, FlyoutMenu } from './NetworkSelectorMod'
import { transparentize } from 'polished'
export { getChainNameFromId, getParsedChainId } from './NetworkSelectorMod'

const Wrapper = styled.div`
  display: flex;

  ${FlyoutMenu} {
    top: 38px;
    right: 0;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      width: 100%;
      left: 0;
      top: 58px;
    `};
  }

  ${SelectorLabel} {
    ${({ theme }) => theme.mediaWidth.upToMedium`
      display: none;
    `};
  }

  ${SelectorControls} {
    border-radius: 21px;
    border: 2px solid transparent;
    padding: 6px;
    transition: border 0.2s ease-in-out;

    > img {
      width: 24px;
      height: 24px;
      object-fit: contain;
      margin: 0 6px 0 0;
    }

    ${SelectorLabel} + svg {
      width: 18px;
      height: 18px;
      stroke-width: 3px;
    }

    &:hover {
      border: 2px solid ${({ theme }) => transparentize(0.7, theme.text1)};
    }
  }
`

export default function NetworkSelector() {
  return (
    <Wrapper>
      <NetworkSelectorMod />
    </Wrapper>
  )
}
