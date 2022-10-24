import { darken } from 'polished'
import styled from 'styled-components/macro'

export const BannerWrapper = styled.div`
  background-color: ${({ theme }) => darken(theme.darkMode ? 0 : 0.08, theme.bg7)};
  border: ${({ theme }) => theme.cardBorder};
  border-radius: ${({ theme }) => theme.buttonOutlined.borderRadius};
  padding: 14px;
  margin: 12px 0 8px;
  font-size: 13px;
  cursor: pointer;
`

export const ClosedBannerWrapper = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 0.7fr auto 0.7fr;
  align-items: center;
  > strong {
    font-weight: 600;
  }
  > img:first-child {
    filter: ${({ theme }) => `invert(${theme.darkMode ? 0 : 1})`};
  }
  > svg:last-child {
    cursor: pointer;
    stroke: ${({ theme }) => (theme.darkMode ? theme.white : theme.black)};
  }
  > svg,
  > strong {
    margin: auto;
  }
`

export const BannerInnerWrapper = styled.div`
  display: grid;
  grid-template-rows: auto;
  align-items: center;
  justify-content: stretch;
  width: 100%;
  text-align: left;
  > p {
    padding: 0 10px;
    margin-bottom: 0;
  }
`

export const WrapEthCta = styled(BannerInnerWrapper)`
  flex-flow: row nowrap;
  text-align: center;
  > span {
    cursor: pointer;
    font-weight: bold;
    margin: 12px 0 4px;
  }
`

export const SpanCta = styled.span`
  > small {
    display: block;
    margin: 5px 0 0;
    font-weight: 400;
  }
`
