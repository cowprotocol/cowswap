import { BoxProps, Text } from 'rebass'
import styled, { DefaultTheme } from 'styled-components/macro'
import useCowBalanceAndSubsidy from 'hooks/useCowBalanceAndSubsidy'
import { LowerSectionWrapper } from '@cow/modules/swap/pure/styled'
import { AutoRow } from 'components/Row'
import { Trans } from '@lingui/macro'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { SUBSIDY_INFO_MESSAGE } from 'components/CowSubsidyModal/constants'
import { StyledInfoIcon } from '@cow/modules/swap/pure/styled'

interface FeesDiscountProps extends BoxProps {
  theme: DefaultTheme
}

const DarkSpan = styled.span`
  padding: 2px 8px;
  background: ${({ theme }) => theme.grey1};
  border-radius: 5px;
  color: ${({ theme }) => theme.text1};
  transition: background 0.2s ease-in-out, color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.bg2};
    color: ${({ theme }) => theme.white};
  }
`

export const FeesDiscount: React.FC<FeesDiscountProps> = ({ onClick, theme, ...boxProps }: FeesDiscountProps) => {
  const { subsidy } = useCowBalanceAndSubsidy()

  return (
    <LowerSectionWrapper {...boxProps}>
      <Text fontWeight={500} fontSize={14} color={theme.text2} alignItems={'center'}>
        <AutoRow>
          <Trans>Fees discount</Trans>{' '}
          <MouseoverTooltipContent
            content={SUBSIDY_INFO_MESSAGE + '. Click on the discount button on the right for more info.'}
            bgColor={theme.bg1}
            color={theme.text1}
            wrap
          >
            <StyledInfoIcon />
          </MouseoverTooltipContent>
        </AutoRow>
      </Text>

      <div className="price-container">
        <DarkSpan onClick={onClick} style={{ cursor: 'pointer' }}>
          {subsidy?.discount || 0}% discount
        </DarkSpan>
      </div>
    </LowerSectionWrapper>
  )
}
