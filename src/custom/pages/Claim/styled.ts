import styled from 'styled-components/macro'
import { CheckCircle, Frown } from 'react-feather'
import { Icon } from 'components/CowProtocolLogo'
import { ButtonPrimary } from 'components/Button'

export const PageWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  max-width: 760px;
  width: 100%;
  background: linear-gradient(315deg, #000000 0%, #000000 55%, #202020 100%);
  color: white;
  border-radius: 24px;
  padding: 32px;

  p {
    font-size: 16px;
    display: block;
    line-height: 1.6;
    font-weight: 300;
    margin: 24px auto;
    text-align: center;
  }

  p > i {
    color: rgb(237, 104, 52);
  }

  p > a {
    display: block;
    margin: 24px 0 0;
    color: rgb(237, 104, 52);
  }

  ${ButtonPrimary} {
    background: rgb(237, 104, 52);
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
`

export const ClaimSummary = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 12px;
  margin: 0 auto 24px;
  background: rgba(151, 151, 151, 0.1);
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
  align-items: center;
  margin: 0 0 24px;

  > div {
    background: grey;
    width: 56px;
    height: 56px;
    border-radius: 56px;
    margin: 0 12px 0 0;
  }

  > span {
    display: flex;
    flex-flow: column wrap;
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
//     background: rgb(237, 104, 52);
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
  stroke: rgb(237, 104, 52);
`

export const NegativeIcon = styled(Frown)`
  height: 16px;
  width: 16px;
  margin-right: 6px;
  stroke: rgb(237, 104, 52);
`

export const EligibleBanner = styled.div<{ type?: string }>`
  width: 100%;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  display: block;
  background: ${({ type }) => (type === 'negative' ? 'red' : 'rgba(237, 104, 52, 0.1)')};
  border: 0.1rem solid rgb(237, 104, 52);
  color: rgb(237, 104, 52);
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
`

export const Demo = styled(ClaimTable)`
  background: #3e0c46;
  > table {
    grid-template-columns: repeat(4, 1fr);
  }
`
