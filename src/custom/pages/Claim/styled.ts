import styled from 'styled-components/macro'
import { CheckCircle, Frown } from 'react-feather'
import { Icon } from 'components/CowProtocolLogo'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import { transparentize } from 'polished'

export const PageWrapper = styled.div`
  --color-tl: #141722;
  --color-tr: #3b4052;
  --color-grey: rgb(151, 151, 151);
  --color-orange: rgb(237, 104, 52);
  --color-container-bg: rgb(255 255 255 / 6%);
  --color-container-bg2: rgb(255 255 255 / 12%);
  --color-container-bg3: rgb(255 255 255 / 25%);
  --border-radius: 56px;
  --border-radius-small: 16px;

  display: flex;
  flex-flow: column wrap;
  max-width: 760px;
  width: 100%;
  color: ${({ theme }) => theme.text1};
  border-radius: var(--border-radius);
  padding: 30px;
  border: ${({ theme }) => theme.appBody.border};
  box-shadow: ${({ theme }) => theme.appBody.boxShadow};
  background: ${({ theme }) => theme.bg1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    border-radius: var(--border-radius-small);
  `};

  a {
    color: ${({ theme }) => theme.primary4};
  }

  p {
    font-size: 16px;
    display: block;
    line-height: 1.6;
    font-weight: 300;
    margin: 24px auto;
    text-align: center;
  }

  p > i {
    color: ${({ theme }) => theme.primary1};
  }

  p > a {
    display: block;
    margin: 24px 0 0;
  }

  ${ButtonPrimary} {
    border-radius: var(--border-radius);
    width: 100%;
    font-size: 21px;
    padding: 24px 16px;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      margin: 0 auto 24px;
    `};

    &[disabled] {
      cursor: not-allowed;
      pointer-events: all;
    }
  }

  ${ButtonSecondary} {
    background: 0;
    color: ${({ theme }) => theme.primary4};
    border: none;

    &:hover {
      border: 0;
      box-shadow: none;
      transform: none;
      background: 0;
      color: ${({ theme }) => theme.primary4};
      text-decoration: underline;
    }
  }
`

export const ClaimSummary = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  padding: 8px;
  background: ${({ theme }) => (theme.currencyInput?.background ? theme.currencyInput?.background : theme.bg1)};
  border: ${({ theme }) =>
    theme.currencyInput?.border ? theme.currencyInput?.border : `border: 1px solid ${theme.bg2}`};
  border-radius: var(--border-radius);
  margin: 0 auto 24px;
  position: relative;
  overflow: hidden;

  h1,
  div {
    z-index: 1;
  }

  p {
    margin: 0;
    display: block;
  }

  > div {
    margin: 0 0 0 18px;
  }
`

export const ClaimSummaryTitle = styled.h1`
  font-size: 1.6rem;
  margin-left: 15px;
`

export const IntroDescription = styled.div<{ center?: boolean }>`
  display: block;
  width: 100%;
  margin: 0 0 24px;
  line-height: 1.6;

  text-align: ${({ center }) => (center ? 'center' : 'initial')};

  > p {
    margin: 8px auto 24px;
  }

  > p > i {
    color: ${({ theme }) => theme.text1};
    font-weight: 600;
    font-style: normal;
  }

  > button {
    width: auto;
    display: inline;
  }
`

export const ClaimTable = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  margin: 0 0 24px;

  table {
    display: grid;
    border-collapse: collapse;
    min-width: 100%;
    font-size: 16px;
    grid-template-columns: repeat(4, auto);
  }

  thead,
  tbody,
  tr {
    display: contents;
  }

  th,
  td {
    padding: 15px;
  }

  th {
    position: sticky;
    top: 0;
    background: transparent;
    text-align: left;
    font-weight: normal;
    font-size: 13px;
    color: ${({ theme }) => theme.text1};
    position: relative;
  }

  th:last-child {
    border: 0;
  }

  td {
    padding-top: 10px;
    padding-bottom: 10px;
    color: ${({ theme }) => theme.text1};
    word-break: break-word;
  }

  tr > td {
    background: var(--color-container-bg);
    margin: 0 0 12px;
  }

  /* 3rd row - amount */
  tr > td:nth-of-type(2) {
    font-size: 21px;
    font-weight: 500;
  }

  tr > td:nth-of-type(3) {
    font-size: 13px;
    display: flex;
    flex-flow: column wrap;
  }

  tr > td:first-of-type {
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
  }

  tr > td:last-of-type {
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`

export const ClaimAccount = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;

  > b {
    font-size: 13px;
    margin: 0 0 6px;
    font-weight: normal;
  }

  > div {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
  }

  > div > img {
    height: 46px;
    width: 46px;
    border-radius: 46px;
    object-fit: contain;
    background-color: var(--color-grey);
  }

  > div > p {
    margin: 0 0 0 10px;
    font-size: 18px;
    font-weight: normal;
  }
`

export const ClaimTotal = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  justify-content: flex-start;
  align-items: flex-start;

  > b {
    font-size: 14px;
    font-weight: normal;
    margin: 0 0 2px;
    opacity: 0.7;
  }

  > p {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
  }
`

export const ConfirmOrLoadingWrapper = styled.div<{ activeBG: boolean }>`
  width: 100%;
  padding: 24px;
  color: ${({ theme }) => theme.text1};
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 26px;
  font-weight: 300;

  h3 {
    font-size: 26px;
    font-weight: 600;
    line-height: 1.2;
    text-align: center;
    margin: 0 0 24px;
    color: ${({ theme }) => theme.text1};
  }
`

export const AttemptFooter = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;

  > p {
    font-size: 14px;
    opacity: 0.7;
  }
`

export const ConfirmedIcon = styled.div`
  padding: 60px 0;
`

export const CheckIcon = styled(CheckCircle)`
  height: 16px;
  width: 16px;
  margin-right: 6px;
  stroke: color: ${({ theme }) => theme.primary1};
`

export const NegativeIcon = styled(Frown)`
  height: 16px;
  width: 16px;
  margin-right: 6px;
  stroke: color: ${({ theme }) => theme.primary1};
`

export const EligibleBanner = styled.div`
  width: 100%;
  border-radius: var(--border-radius);
  padding: 12px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => transparentize(0.9, theme.attention)};
  color: ${({ theme }) => theme.attention};
  text-align: center;
  margin: 0 auto 16px;
  font-weight: 600;
`

export const InputField = styled.div`
  padding: 18px;
  border-radius: var(--border-radius);
  ${({ theme }) => theme.currencyInput?.color};
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.currencyInput?.background};
  width: 100%;
  margin: 0 0 24px;

  > input {
    background: transparent;
    border: 0;
    font-size: 24px;
    color: inherit
    outline: 0;
    color: ${({ theme }) => theme.text1};
    width: 100%;
  }

  > input::placeholder {
    color: inherit;
    opacity: 0.7;
  }

  > b {
    display: block;
    margin: 0 0 12px;
    font-weight: normal;
  }

  > div {
    display: flex;
    width: 100%;
  }

  > div > p {
    display: flex;
    align-items: center;
    margin: 0 0 0 6px;
    padding: 0;
    font-size: 22px;
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
  }
`

export const InputError = styled.div`
  color: red;
`

export const InputErrorText = styled.div`
  margin: 0 0 24px;
`

export const InputFieldTitle = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0 12px;
  font-weight: normal;
  color: inherit;

  > b {
    margin-right: 10px;
  }
`

export const CheckAddress = styled.div`
  display: flex;
  width: 100%;
  flex-flow: column wrap;

  ${Icon} {
    margin: 0 auto;
  }

  > h1 {
    font-size: 32px;
    font-weight: 300;
    text-align: center;
  }

  > h1 > b {
    font-weight: bold;
  }

  > p {
    text-align: center;
    font-size: 18px;
    line-height: 1.2;
    margin: 0 0 24px;
  }
`

export const ClaimBreakdown = styled.div`
  display: flex;
  width: 100%;
  flex-flow: column wrap;
`

export const FooterNavButtons = styled.div`
  display: flex;
  width: 100%;
  flex-flow: column wrap;

  ${ButtonSecondary} {
    margin: 24px auto 0;
    color: var(--colorgrey);
    transition: color 0.2s ease-in-out;

    &:hover {
      color: ${({ theme }) => theme.primary1};
      text-decoration: underline;
    }

    > svg {
      margin: 0 6px 0 0;
    }
  }
`

export const TopNav = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: transparent;
  padding: 0;
  margin: 0 auto 24px;

  ${ButtonSecondary} {
    margin: 0;
    color: ${({ theme }) => theme.text1};
    font-size: 15px;
    width: auto;
  }
`

export const Demo = styled(ClaimTable)`
  background: #3e0c46;
  > table {
    grid-template-columns: repeat(4, 1fr);
  }

  > table tr td:first-of-type {
    opacity: 0.6;
  }
  > table tr td:last-of-type {
    font-weight: bold;
  }
`

export const InvestFlow = styled.div`
  display: flex;
  flex-flow: column wrap;
`

export const InvestContent = styled.div`
  display: flex;
  flex-flow: column wrap;
`

export const StepIndicator = styled.div`
  display: flex;
  flex-flow: column wrap;
`

export const Steps = styled.div<{ step: number | 0 }>`
  list-style-type: decimal;
  margin: 0 0 12px;
  background: var(--color-container-bg);
  padding: 12px;
  border-radius: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 34px;

  > li {
    margin: 0 0 12px;
  }

  > li:nth-of-type(${({ step }) => step}) {
    background: rgb(237 104 52 / 29%);
  }
`

export const TokenLogo = styled.div<{ symbol: string; size: number }>`
  display: flex;
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  border-radius: ${({ size }) => `${size}px`};
  /* background: ${({ symbol }) => `url(${symbol}.png) no-repeat center/contain`}; */
  background: grey;
`

export const InvestTokenGroup = styled.div`
  display: flex;
  flex-flow: row;
  width: 100%;
  padding: 24px;
  margin: 0 0 24px;
  border: 1px solid #3a3a3a;

  > div {
    display: flex;
    flex-flow: column wrap;
    flex: 0 1 auto;
    padding: 0 32px 0 0;
  }

  > div > span {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    margin: 0 25px 0 0;
  }

  > div > h3 {
    font-size: 14px;
  }

  ${TokenLogo},
  ${Icon} {
    border: 4px solid black;
  }

  ${TokenLogo} {
    margin: 0 -34px 0 0;
  }

  > span {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    gap: 18px;
  }
`

export const InvestInput = styled.span`
  display: flex;
  flex-flow: column wrap;
  font-size: 15px;
  width: 100%;

  > div {
    display: flex;
    flex-flow: column wrap;
    gap: 8px;
    width: 100%;
  }

  > div > label {
    display: flex;
    position: relative;
  }

  > div > label > b {
    text-transform: uppercase;
    display: flex;
    align-items: center;
    position: absolute;
    right: 12px;
    top: 0;
    bottom: 0;
    margin: auto;
    opacity: 0.5;
  }

  > div > label > input {
    color: ${({ theme }) => theme.text1};
    border: 1px solid grey;
    border-radius: 12px;
    padding: 12px 70px 12px 12px;
    font-size: 26px;
    outline: 0;
    width: 100%;
  }

  > div > small {
    color: red;
    margin: 12px 0;
  }
`

export const InvestAvailableBar = styled.div<{ percentage?: number }>`
  width: 100%;
  display: flex;
  position: relative;
  height: 10px;
  border-radius: 24px;
  background: var(--color-container-bg2);
  margin: 8px 0;

  &::before {
    content: '';
    display: block;
    background: color: ${({ theme }) => theme.primary1};
    height: 100%;
    border-radius: 24px;
    width: ${({ percentage }) => (percentage ? `${percentage}%` : '0%')};
  }

  &::after {
    content: ${({ percentage }) => (percentage ? `'${percentage}%'` : '0%')};
    display: inline-block;
    font-size: 13px;
    color: ${({ theme }) => theme.primary1};
  }
`

export const InvestSummary = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: auto auto;
  font-size: 15px;

  > span {
    display: flex;
    flex-flow: column wrap;
    margin: 0 0 12px;
  }
`

export const InvestFlowValidation = styled.div`
  width: 100%;
  border-radius: var(--border-radius);
  padding: 12px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgb(255 0 0 / 25%);
  color: red;
  text-align: center;
  margin: 0 auto 16px;
`

export const InvestTokenSubtotal = styled.div`
  display: flex;
  padding: 56px;
  margin: 0 0 24px;
  background: var(--color-container-bg3);
  color: ${({ theme }) => theme.text1};
  border-radius: var(--border-radius);
  font-size: 21px;
`

export const ClaimAccountButtons = styled.div`
  display: flex;
  flex-direction: column;
`
