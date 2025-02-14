import styled from 'styled-components/macro'
import { ArrowDownRight, ArrowUpRight } from 'react-feather'
import { TransitionDuration, textFadeIn, Color } from '@cowprotocol/ui'

export const ChartHeader = styled.div`
  position: absolute;
  ${textFadeIn};
  animation-duration: ${TransitionDuration.medium};
  color: ${Color.cowfi_grey3};
`

export const TokenPrice = styled.span`
  font-size: 36px;
  line-height: 44px;
`

export const MissingPrice = styled(TokenPrice)`
  font-size: 24px;
  line-height: 44px;
  color: ${Color.cowfi_grey3};
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
  color: ${Color.cowfi_grey3};
`

export const StyledUpArrow = styled((props) => <ArrowUpRight {...props} />)`
  color: ${({ theme }) => theme.success};
`

export const StyledDownArrow = styled((props) => <ArrowDownRight {...props} />)`
  color: ${({ theme }) => theme.danger};
`

export const TokenPriceWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  color: ${Color.neutral10};
`
