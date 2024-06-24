import { UI } from '@cowprotocol/ui'

import { Box } from 'rebass/styled-components'
import styled from 'styled-components/macro'

const Card = styled(Box)<{ width?: string; padding?: string; border?: string; $borderRadius?: string }>`
  width: ${({ width }) => width ?? '100%'};
  padding: ${({ padding }) => padding ?? '1rem'};
  border-radius: ${({ $borderRadius }) => $borderRadius ?? '16px'};
  border: ${({ border }) => border};
  color: inherit;
`
export default Card

export const LightCard = styled(Card)`
  background-color: var(${UI.COLOR_PAPER});
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    border-radius: 16px;
    height: 100%;
    border: 2px solid var(${UI.COLOR_PAPER_DARKEST});
    opacity: 0.2;
    user-select: none;
    pointer-events: none;
  }
`

export const GreyCard = styled(Card)`
  background-color: var(${UI.COLOR_PAPER_DARKER});
`

export const OutlineCard = styled(Card)`
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
`

export const YellowCard = styled(Card)`
  background-color: rgba(243, 132, 30, 0.05);
  color: ${({ theme }) => theme.yellow3};
  font-weight: 500;
`
