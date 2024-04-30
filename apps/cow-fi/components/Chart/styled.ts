import styled from 'styled-components'
import { ArrowDownRight, ArrowUpRight } from 'react-feather'
import { Color, TransitionDuration } from 'styles/variables'
import { textFadeIn } from 'styles/variables'

export const ChartHeader = styled.div`
  position: absolute;
  ${textFadeIn};
  animation-duration: ${TransitionDuration.medium};
`

export const TokenPrice = styled.span`
  font-size: 36px;
  line-height: 44px;
`

export const MissingPrice = styled(TokenPrice)`
  font-size: 24px;
  line-height: 44px;
  color: ${Color.grey3};
`

export const DeltaContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.6rem;
  margin-left: 10px;
`

export const ArrowCell = styled.div`
  padding-right: 3px;
  display: flex;
`

export const MissingPriceCaption = styled.div`
  color: ${Color.grey3};
`

export const StyledUpArrow = styled(ArrowUpRight)`
  color: ${Color.success};
`

export const StyledDownArrow = styled(ArrowDownRight)`
  color: ${Color.danger};
`

export const TokenPriceWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`
