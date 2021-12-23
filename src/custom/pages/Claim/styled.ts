import styled from 'styled-components/macro'
import { CheckCircle, Frown } from 'react-feather'
import { Icon } from 'components/CowProtocolLogo'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'

export const PageWrapper = styled.div`
  --color-tl: #141722;
  --color-tr: #3b4052;
  --color-grey: rgb(151, 151, 151);
  --color-orange: rgb(237, 104, 52);

  display: flex;
  flex-flow: column wrap;
  max-width: 760px;
  width: 100%;
  background: linear-gradient(315deg, #000000 0%, #000000 55%, #202020 100%);
  color: white;
  border-radius: 24px;
  padding: 32px;

  a {
    color: var(--color-orange);
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
    color: var(--color-orange);
  }

  p > a {
    display: block;
    margin: 24px 0 0;
  }

  ${ButtonPrimary} {
    background: var(--color-orange);
    border: 0;
    box-shadow: none;
    color: black;
    border-radius: 12px;
    width: 100%;
    font-size: 21px;
    padding: 24px 16px;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      margin: 0 auto 24px;
    `};

    &:hover {
      border: 0;
      box-shadow: none;
      transform: none;
      background: rgb(247 127 80);
      color: black;
    }

    &[disabled] {
      background: rgba(151, 151, 151, 0.6);
      cursor: not-allowed;
      pointer-events: all;
    }
  }

  ${ButtonSecondary} {
    background: 0;
    color: var(--color-orange);
    border: none;

    &:hover {
      border: 0;
      box-shadow: none;
      transform: none;
      background: 0;
      color: inherit;
    }
  }
`

export const ClaimSummary = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  padding: 32px;
  border-radius: 12px;
  margin: 0 auto 24px;
  /* background: linear-gradient(315deg, #000000 0%, #000000 55%, #202020 100%); */
  position: relative;
  color: #bbbbbb;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    filter: blur(75px);
    background: conic-gradient(var(--color-tr) 25%, var(--color-tl) 0 28%, var(--color-tr) 0 30%, var(--color-tl) 0);
    opacity: 1;
  }

  h1,
  div {
    z-index: 1;
  }

  p {
    margin: 0;
    display: block;
  }

  > div {
    margin: 0 0 0 24px;
  }
`

export const IntroDescription = styled.div`
  display: block;
  width: 100%;
  margin: 0 0 24px;
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
    font-size: 14px;
    grid-template-columns: repeat(7, auto);
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
    background: rgba(151, 151, 151, 0.3);
    text-align: left;
    font-weight: normal;
    font-size: 13px;
    color: white;
    position: relative;
  }

  th:last-child {
    border: 0;
  }

  td {
    padding-top: 10px;
    padding-bottom: 10px;
    color: white;
    word-break: break-word;
  }

  tr:nth-child(even) td {
    background: rgba(151, 151, 151, 0.1);
  }
`

export const ClaimAccount = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 0 0 24px;

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
    background: rgb(255 255 255 / 8%);
    border-radius: 36px;
    padding: 12px 18px;
  }

  > div > img {
    height: 46px;
    width: 46px;
    border-radius: 46px;
    object-fit: contain;
    background-color: var(--color-grey);
  }

  > div > span {
    display: flex;
    flex-flow: column wrap;
    align-items: flex-start;
  }

  > div > span > p {
    margin: 0 0 0 10px;
    font-size: 18px;
    color: white;
    font-weight: normal;
  }
`

export const ClaimTotal = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 0 0 24px;

  > b {
    font-size: 14px;
    font-weight: normal;
    margin: 0 0 2px;
  }

  > p {
    margin: 0;
    font-size: 24px;
    color: white;
    font-weight: bold;
  }
`

export const ConfirmOrLoadingWrapper = styled.div<{ activeBG: boolean }>`
  width: 100%;
  padding: 24px;
  color: white;
  position: relative;
  background: linear-gradient(315deg, #000000 0%, #000000 55%, #202020 100%);
  /* background: ${({ activeBG }) =>
    activeBG &&
    'radial-gradient(76.02% 75.41% at 1.84% 0%, rgba(255, 0, 122, 0.2) 0%, rgba(33, 114, 229, 0.2) 100%), #FFFFFF;'}; */

  h3 {
    font-size: 26px;
    font-weight: 600;
    line-height: 1.2;
    text-align: center;
    margin: 0 0 24px;
    color: white;
  }
`

export const AttemptFooter = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;

  > p {
    font-size: 14px;
  }
`

export const ConfirmedIcon = styled.div`
  padding: 60px 0;
`

// export const ContentWrapper = styled.div`
//   background: linear-gradient(315deg, #000000 0%, #000000 55%, #202020 100%);
//   padding: 32px;
//   min-height: 500px;
//   height: 100%;
//   width: 100%;
//   position: relative;
//   color: #bbbbbb;

//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     padding: 20px;
//     min-height: initial;
//   `};

//   > button {
//     background: var(--color-orange);
//     border: 0;
//     box-shadow: none;
//     color: black;

//     ${({ theme }) => theme.mediaWidth.upToSmall`
//       margin: 0 auto 24px;
//     `};

//   }

//   h3 {
//     font-size: 26px;
//     font-weight: 300;
//     line-height: 1.2;
//     text-align: center;
//     margin: 0 0 24px;
//     color: white;

//     > b {
//       font-weight: 600;
//     }
//   }

// `

export const CheckIcon = styled(CheckCircle)`
  height: 16px;
  width: 16px;
  margin-right: 6px;
  stroke: var(--color-orange);
`

export const NegativeIcon = styled(Frown)`
  height: 16px;
  width: 16px;
  margin-right: 6px;
  stroke: var(--color-orange);
`

export const EligibleBanner = styled.div`
  width: 100%;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  display: block;
  background: rgba(237, 104, 52, 0.1);
  border: 0.1rem solid var(--color-orange);
  color: var(--color-orange);
  text-align: center;
  margin: 0 auto 16px;
`

export const TopTitle = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 30px 0;
`

export const InputField = styled.div`
  padding: 18px;
  border-radius: 16px;
  border: 1px solid rgba(151, 151, 151, 0.4);
  background: rgba(151, 151, 151, 0.1);
  width: 100%;
  margin: 0 0 24px;

  > input {
    background: transparent;
    border: 0;
    font-size: 24px;
    color: white;
    outline: 0;
    width: 100%;
  }

  > input::placeholder {
    color: rgba(151, 151, 151, 0.4);
  }

  > b {
    display: block;
    margin: 0 0 12px;
    font-weight: normal;
    color: #979797;
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
    color: white;
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
      color: var(--color-orange);
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

  ${ButtonSecondary} {
    margin: 0;
    color: var(--color-orange);
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

export const DemoToggle = styled.button`
  background: rgb(255 255 255 / 17%);
  color: white;
  border: 0;
  margin: 0 0 16px;
  font-size: 12px;
  padding: 5px 0;
`
