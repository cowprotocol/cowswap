import { RouteComponentProps } from 'react-router-dom'
import styled from 'styled-components/macro'

import SwapMod from './SwapMod'
import { AutoRow } from 'components/Row'
import { Container, Wrapper as WrapperUni } from 'components/swap/styleds'
import { AutoColumn } from 'components/Column'
import { ClickableText } from 'pages/Pool/styleds'
import { InputContainer } from 'components/AddressInputPanel'
import Card, { GreyCard } from 'components/Card'
import { Wrapper as ArrowWrapper } from 'components/ArrowWrapperLoader'

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

export default function Swap(props: RouteComponentProps) {
  return (
    <Container>
      <SwapModWrapper {...props} />
    </Container>
  )
}
