import { RouteComponentProps } from 'react-router-dom'
import styled, { DefaultTheme } from 'styled-components/macro'
import { BoxProps, Text } from 'rebass'

import SwapMod from './SwapMod'
import { AutoRow } from 'components/Row'
import { Wrapper as WrapperUni, Container } from 'components/swap/styleds'
import { AutoColumn } from 'components/Column'
import { ClickableText } from 'pages/Pool/styleds'
import { InputContainer } from 'components/AddressInputPanel'
import { GreyCard } from 'components/Card'
import Card from 'components/Card'
import {
  ButtonError as ButtonErrorMod,
  ButtonPrimary as ButtonPrimaryMod,
  ButtonLight as ButtonLightMod,
} from 'components/Button'
import { Wrapper as ArrowWrapper } from 'components/ArrowWrapperLoader'
import { Trans } from '@lingui/macro'
import { HighFeeWarning, WarningProps, NoImpactWarning } from 'components/SwapWarnings'
import { useWalletInfo } from 'hooks/useWalletInfo'

import { MouseoverTooltipContent } from 'components/Tooltip'
import { StyledInfo } from './styleds'
import { SUBSIDY_INFO_MESSAGE } from 'components/CowSubsidyModal/constants'

import useCowBalanceAndSubsidy from 'hooks/useCowBalanceAndSubsidy'
import { LowerSectionWrapper } from 'pages/Swap/styled'

export const ButtonError = styled(ButtonErrorMod)`
  > div,
  > div > div {
    width: 100%;
    word-break: break-all;
    text-align: center;
    align-items: center;
  }
`

export const ButtonPrimary = styled(ButtonPrimaryMod)`
  > div,
  > div > div {
    width: 100%;
    word-break: break-all;
    text-align: center;
    align-items: center;
  }
`

export const ButtonLight = styled(ButtonLightMod)`
  > div,
  > div > div {
    width: 100%;
    word-break: break-all;
    text-align: center;
    align-items: center;
  }
`

const SwapModWrapper = styled(SwapMod)`
  ${(props) => props.className} {
    // For now to target <SwapHeader /> without copying files...
    > div:first-child {
      padding: 0 12px 4px;
      max-width: 100%;
      margin: 0;
    }

    ${WrapperUni} {
      padding: 4px 4px 0;
    }

    ${AutoColumn} {
      grid-row-gap: 8px;
      margin: 0 0 12px;
    }

    ${ClickableText} {
      color: ${({ theme }) => theme.text1};
    }

    ${Card} > ${AutoColumn} {
      margin: 4px auto 0;
      font-size: 13px;
      grid-row-gap: 0;

      > div > div,
      > div > div div {
        color: ${({ theme }) => theme.text1};
        font-size: 13px;
      }
    }

    ${GreyCard} {
      > div {
        color: ${({ theme }) => theme.text1};
      }
    }

    ${InputContainer} > div > div > div {
      color: ${({ theme }) => theme.text1};
    }

    .expertMode ${ArrowWrapper} {
      position: relative;
    }

    ${AutoRow} {
      z-index: 2;
    }
  }
`

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

export const LightGreyText = styled.span`
  font-weight: 400;
  color: ${({ theme }) => theme.text4};
`

export default function Swap(props: RouteComponentProps) {
  const { allowsOffchainSigning } = useWalletInfo()
  return (
    <Container>
      <SwapModWrapper
        HighFeeWarning={HighFeeWarning}
        NoImpactWarning={NoImpactWarning}
        allowsOffchainSigning={allowsOffchainSigning}
        FeesDiscount={FeesDiscount}
        {...props}
      />
    </Container>
  )
}

export interface SwapProps extends RouteComponentProps {
  HighFeeWarning: React.FC<WarningProps>
  NoImpactWarning: React.FC<WarningProps>
  FeesDiscount: React.FC<FeesDiscountProps>
  className?: string
  allowsOffchainSigning: boolean
}
