import styled from 'styled-components/macro'

import { ButtonSecondary } from 'legacy/components/Button'
import { YellowCard } from 'legacy/components/Card'
import { CopyIcon, TransactionStatusText } from 'legacy/components/Copy'
import { StyledLink } from 'legacy/theme'
import { ExternalLink } from 'legacy/theme'

import {
  StatusLabelWrapper,
  Summary,
  TransactionWrapper,
  TransactionStatusText as ActivityDetailsText,
  SummaryInner,
  TransactionInnerDetail,
  TextAlert,
} from '../../containers/Transaction/styled'

export const WalletName = styled.div`
  width: initial;
  font-size: 0.825rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text3};
`

export const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`

export const TransactionListWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
`

export const WalletAction = styled(ButtonSecondary)`
  width: fit-content;
  font-weight: 400;
  margin-left: 8px;
  font-size: 0.825rem;
  padding: 4px 6px;
  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`

export const WalletActions = styled.div`
  display: flex;
  flex-flow: row wrap;
  margin: 10px 0 0;
`

export const AddressLink = styled(ExternalLink)<{ hasENS: boolean; isENS: boolean }>`
  font-size: 0.825rem;
  color: ${({ theme }) => theme.text3};
  margin-left: 1rem;
  font-size: 0.825rem;
  display: flex;
  :hover {
    color: ${({ theme }) => theme.text2};
  }
`

export const AccountControl = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 0;
  width: 100%;

  font-weight: 500;
  font-size: 1.25rem;

  a:hover {
    text-decoration: underline;
  }

  p {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

export const WalletSecondaryActions = styled.div``

export const WalletNameAddress = styled.div`
  width: 100%;
  font-size: 23px;
  font-weight: 500;
  margin: 0 0 0 8px;
`

export const Wrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  color: ${({ theme }) => theme.text1};
  padding: 0;
  height: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 12px 0 0;
  `};

  ${WalletName},
  ${AddressLink},
  ${CopyIcon},
  ${WalletAction} {
    color: ${({ theme }) => theme.text1};
    opacity: 0.85;
    transition: color 0.2s ease-in-out, opacity 0.2s ease-in-out;
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 14px;
    font-weight: normal;

    &:focus,
    &:hover {
      opacity: 1;
      transform: none;
      box-shadow: none;
      border: 0;
    }
  }

  ${IconWrapper} {
    margin: 0;
  }

  ${TransactionStatusText} {
    order: 2;
    margin: 0 0 0 8px;
    align-self: center;
    font-size: 21px;
    color: ${({ theme }) => theme.text1};
  }

  ${WalletName} {
    width: 100%;
    text-align: center;
    justify-content: center;
    margin: 0;
    font-size: 12px;
  }

  ${TransactionListWrapper} {
    padding: 0;
    width: 100%;
    flex-flow: column wrap;
  }

  ${AccountControl} {
    ${({ theme }) => theme.mediaWidth.upToSmall`
        align-items: center;
    `};
  }

  ${AccountControl} ${WalletSecondaryActions} {
    width: 100%;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
    justify-items: flex-end;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      justify-items: center;
      margin: 12px auto 0;
    `};

    > a,
    > button {
      align-items: center;
      background: transparent;
      min-height: initial;
      cursor: pointer;
      animation: none;

      &:hover {
        cursor: pointer;
      }
    }

    > a:not(:last-child) {
      margin: 0 0 5px;
    }
  }

  ${AccountControl} ${WalletActions} {
    ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 100%;
        flex-flow: row wrap;
        justify-content: center;
        margin: 12px auto;
    `};
  }
`

export const WalletWrapper = styled.div`
  > div > img[alt='Gnosis Safe Multisig logo'] {
    ${({ theme }) => theme.util.invertImageForDarkMode};
  }
`

export const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }

  flex: 1 1 auto;
  width: 100%;
`

export const InfoCard = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  margin: 0 24px 24px;
  border-radius: 16px;
  padding: 24px;
  background: ${({ theme }) => theme.grey1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px 10px 24px;
    margin: 0 16px 16px;
  `};
`

export const AccountSection = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  padding: 0;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0;`};
`

export const AccountGroupingRow = styled.div`
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.text1};

  div {
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
  }

  margin: 0;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};

  > div {
    flex-flow: column wrap;
    justify-content: flex-start;
    align-items: flex-start;
  }
`

export const NoActivityMessage = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
  width: 100%;
  padding: 24px 0 0;
  text-align: center;
  display: flex;
  justify-content: center;
`

export const LowerSection = styled.div`
  border-radius: 0;
  height: 100%;
  width: 100%;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 0 24px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0 16px;
  `};

  > span {
    display: flex;
    color: ${({ theme }) => theme.text1};
    justify-content: space-between;
    padding: 0 0 12px;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      top: 42px;
    `};
  }

  > div {
    display: flex;
    flex-flow: column wrap;
    width: 100%;
    background-color: inherit;
    padding: 0 0 48px;

    > ${StyledLink} {
      width: 100%;
      text-align: center;
      margin: 24px auto 0;
    }
  }

  > span > h5 {
    margin: 0;
    font-weight: 500;
    color: inherit;
    line-height: 1;
    display: flex;
    align-items: center;

    > span {
      opacity: 0.6;
      margin: 0 0 0 4px;
    }
  }

  > span > ${StyledLink} {
    color: ${({ theme }) => theme.text1};
    text-decoration: underline;
    font-size: 14px;

    &:hover {
      color: ${({ theme }) => theme.text3};
    }
  }
`

// TODO: Prevent beyond 3 level selector nestings
export const LowerSectionSimple = styled(LowerSection)`
  padding: 0;

  > div {
    padding: 0;

    ${StyledLink} {
      align-self: center;
      margin: 7px 0 0;
      font-size: 12px;
    }
    ${TransactionWrapper} {
      padding: 15px;

      // target the activity comp
      > div > ${ActivityDetailsText} > ${Summary} {
        grid-template-columns: auto auto;

        > span {
          display: none;
        }

        > ${SummaryInner} {
          // Gnosis safe
          > ${TransactionInnerDetail} {
            padding: 0;
            border: none;
            margin-top: 10px;
            > a {
              align-self: flex-start;
            }
            > span:last-of-type {
              margin: 3px 0 0px;
            }
            > ${TextAlert} {
              margin: 10px 0 6px;
            }
          }
          ${({ theme }) => theme.mediaWidth.upToSmall`
            margin: 16px 0;
          `}

          > b {
            display: none;
          }
        }
      }

      > ${StatusLabelWrapper} {
        margin: auto;
      }
    }
  }
`

const NetworkCardUni = styled(YellowCard)`
  border-radius: 12px;
  padding: 8px 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    margin-right: 0.5rem;
    width: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  `};
`

export const NetworkCard = styled(NetworkCardUni)`
  background-color: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1};
  padding: 6px 8px;
  font-size: 13px;
  margin: 0 8px 0 0;
  letter-spacing: 0.7px;
  min-width: initial;
  flex: 0 0 fit-content;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0 auto 12px;
  `};
`
