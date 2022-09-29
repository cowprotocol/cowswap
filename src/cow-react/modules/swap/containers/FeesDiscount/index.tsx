import { BoxProps, Text } from 'rebass'
import styled, { DefaultTheme } from 'styled-components/macro'
import useCowBalanceAndSubsidy from 'hooks/useCowBalanceAndSubsidy'
import { LowerSectionWrapper } from 'cow-react/modules/swap/pure/styled'
import { AutoRow } from 'components/Row'
import { Trans } from '@lingui/macro'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { SUBSIDY_INFO_MESSAGE } from 'components/CowSubsidyModal/constants'
import { StyledInfo } from 'cow-react/pages/Swap/styleds'

interface FeesDiscountProps extends BoxProps {
  theme: DefaultTheme
}

const DarkSpan = styled.span`
  padding: 2px 8px;
  background-color: ${({ theme }) => theme.bg4};
  border-radius: 5px;
  color: ${({ theme }) => theme.text1};
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
            <StyledInfo />
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
