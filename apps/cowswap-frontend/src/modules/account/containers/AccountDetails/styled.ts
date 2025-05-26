import { Command } from '@cowprotocol/types'
import { ButtonSecondary, Media } from '@cowprotocol/ui'
import { ExternalLink, StyledLink } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { YellowCard } from 'legacy/components/Card'
import { CopyIcon, TransactionStatusText } from 'legacy/components/Copy'

import { TransactionInnerDetail } from 'common/pure/TransactionInnerDetail'

import {
  StatusLabelWrapper,
  Summary,
  SummaryInner,
  TextAlert,
  TransactionStatusText as ActivityDetailsText,
  TransactionWrapper,
} from '../../containers/Transaction/styled'

export const WalletName = styled.div`
  width: initial;
  font-size: 0.825rem;
  font-weight: 500;
  color: ${({ theme }) => theme.info};
`

export const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  border-radius: ${({ size }) => (size ? size + 'px' : '32px')};
  height: ${({ size }) => (size ? size + 'px' : '32px')};
  width: ${({ size }) => (size ? size + 'px' : '32px')};

  ${Media.upToMedium()} {
    align-items: flex-end;
  }

  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
`

export const TransactionListWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
`

export const WalletIconSmall = styled.img`
  width: 16px;
  height: 16px;
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

  ${WalletIconSmall} {
    margin-left: 5px;
  }
`

export const WalletActions = styled.div`
  display: flex;
  margin: 10px 0 0;
  flex-flow: column wrap;
  gap: 10px;
  align-items: flex-start;
`

export const AddressLink = styled(ExternalLink)<{ hasENS: boolean; isENS: boolean }>`
  font-size: 0.825rem;
  color: inherit;
  margin-left: 1rem;
  font-size: 0.825rem;
  display: flex;
  :hover {
    color: inherit;
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

export const UnsupportedWalletBox = styled.div`
  width: 100%;
  text-align: center;
  font-size: 14px;
  margin-top: 60px;
`

export const WalletSecondaryActions = styled.div``

export const WalletNameAddress = styled.div`
  width: 100%;
  font-size: 20px;
  font-weight: 500;
  margin: 0 0 0 8px;
`

export const Wrapper = styled.div`
  display: block;
  width: 100%;
  color: inherit;
  padding: 0;
  height: 100%;
  margin: 0 24px;

  ${Media.upToMedium()} {
    padding: 12px 0 0;
    margin: 0 16px;
  }

  ${WalletName},
  ${AddressLink},
  ${CopyIcon},
  ${WalletAction} {
    color: inherit;
    opacity: 0.85;
    transition:
      color var(${UI.ANIMATION_DURATION}) ease-in-out,
      opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
    margin: auto;
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
    color: inherit;
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
    ${Media.upToSmall()} {
      align-items: center;
    }
  }

  ${AccountControl} ${WalletSecondaryActions} {
    width: 100%;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
    justify-items: flex-end;

    ${Media.upToSmall()} {
      justify-items: center;
      margin: 12px auto 0;
    }

    > a,
    > button {
      align-items: center;
      background: transparent;
      min-height: initial;
      cursor: pointer;
      animation: none;
      margin: 0;

      &:hover {
        cursor: pointer;
      }
    }
  }

  ${AccountControl} ${WalletActions} {
    ${Media.upToSmall()} {
      width: 100%;
      flex-flow: row wrap;
      justify-content: center;
      margin: 12px auto;
    }
  }
`

export const WalletWrapper = styled.div`
  > div > img[alt='Gnosis Safe Multisig logo'] {
    ${({ theme }) => theme.invertImageForDarkMode};
  }
`

export const InfoCard = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  border-radius: 16px;
  padding: 24px;
  background: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;

  &:not(:first-child) {
    margin: 24px 0;
  }

  ${Media.upToSmall()} {
    padding: 16px 10px 24px;

    &:not(:first-child) {
      margin: 16px 0;
    }
  }
`

export const AccountGroupingRow = styled.div`
  justify-content: space-between;
  align-items: center;
  color: inherit;

  div {
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
  }

  margin: 0;

  ${Media.upToSmall()} {
    width: 100%;
  }

  > div {
    flex-flow: column wrap;
    justify-content: flex-start;
    align-items: flex-start;
  }
`

export const NoActivityMessage = styled.p`
  font-size: 14px;
  color: inherit;
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
  color: inherit;

  > span {
    display: flex;
    color: inherit;
    justify-content: space-between;
    padding: 0 0 12px;

    ${Media.upToMedium()} {
      top: 42px;
    }
  }

  > div {
    display: flex;
    flex-flow: column wrap;
    width: 100%;
    background-color: inherit;
    padding: 0 0 48px;
    color: inherit;

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
      color: inherit;
    }
  }

  > span > ${StyledLink} {
    color: inherit;
    text-decoration: underline;
    font-size: 14px;

    &:hover {
      color: ${({ theme }) => theme.info};
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
        grid-template-rows: max-content;

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
          ${Media.upToSmall()} {
            margin: 16px 0;
          }

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

  ${Media.upToSmall()} {
    margin: 0;
    margin-right: 0.5rem;
    width: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  }
`

export const NetworkCard = styled(NetworkCardUni)`
  background-color: var(${UI.COLOR_PAPER});
  color: inherit;
  padding: 6px 8px;
  font-size: 13px;
  margin: 0;
  letter-spacing: 0.7px;
  min-width: initial;
  flex: 0 0 fit-content;

  ${Media.upToSmall()} {
    margin: 0 auto 12px;
  }
`

interface WalletSelectorProps {
  isHardWareWallet?: boolean
  onClick?: Command
}

export const WalletSelector = styled.div<WalletSelectorProps>`
  display: flex;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;

  ${({ isHardWareWallet }) =>
    isHardWareWallet &&
    `
    cursor: pointer;
    border: 1px solid var(${UI.COLOR_TEXT_OPACITY_25});
    background: transparent;
    padding: 6px 10px;

    &:after {
      content: '';
      display: block;
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 4px solid var(${UI.COLOR_TEXT});
      margin-left: 8px;
      opacity: 0.5;
      transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
    }

    &:hover {
      background: var(${UI.COLOR_TEXT_OPACITY_25});
    }

    &:hover::after {
      opacity: 1;
    }
  `}
`
