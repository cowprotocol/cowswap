import { AutoRow } from '@cowprotocol/ui'
import { MouseoverTooltipContent } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { BoxProps, Text } from 'rebass'
import styled, { DefaultTheme } from 'styled-components/macro'

import { SUBSIDY_INFO_MESSAGE } from 'legacy/components/CowSubsidyModal/constants'
import useCowBalanceAndSubsidy from 'legacy/hooks/useCowBalanceAndSubsidy'

import { StyledInfoIcon } from 'modules/swap/pure/styled'
import { LowerSectionWrapper } from 'modules/swap/pure/styled'

import { UI } from 'common/constants/theme'

interface FeesDiscountProps extends BoxProps {
  theme: DefaultTheme
}

const DarkSpan = styled.span`
  padding: 2px 8px;
  background: var(${UI.COLOR_GREY});
  border-radius: 5px;
  color: var(${UI.COLOR_TEXT1});
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
            bgColor={theme.grey1}
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
