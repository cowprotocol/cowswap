import styled from 'styled-components/macro'
import NetworkSelectorMod, { SelectorLabel, SelectorControls } from './NetworkSelectorMod'
import { transparentize } from 'polished'

const Wrapper = styled.div`
  display: flex;

  ${SelectorLabel} {
    ${({ theme }) => theme.mediaWidth.upToMedium`
      display: none;
    `};
  }

  ${SelectorControls} {
    border-radius: 21px;
    border: 1px solid transparent;
    padding: 6px 12px;
    transition: border 0.2s ease-in-out;

    &:hover {
      border: 1px solid ${({ theme }) => transparentize(0.4, theme.text1)};
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
