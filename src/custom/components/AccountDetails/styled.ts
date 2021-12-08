import styled from 'styled-components/macro'
import { CopyIcon, TransactionStatusText } from 'components/Copy'
import { LinkStyledButton } from 'theme'
import {
  WalletName,
  AccountSection as AccountSectionMod,
  AccountGroupingRow as AccountGroupingRowMod,
  UpperSection as UpperSectionMod,
  AddressLink,
  WalletAction,
  TransactionListWrapper,
  AccountControl,
  IconWrapper,
} from './AccountDetailsMod'
import { YellowCard } from 'components/Card'

export const WalletActions = styled.div`
  display: flex;
  flex-flow: row wrap;
  margin: 10px 0 0;
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

    > a {
      align-items: center;
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

export const UpperSection = styled(UpperSectionMod)`
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
  ${({ theme }) => theme.card.background3};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px 10px 24px;
    margin: 0 16px 16px;
  `};
`

export const AccountSection = styled(AccountSectionMod)`
  padding: 0;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0;`};
`

export const AccountGroupingRow = styled(AccountGroupingRowMod)`
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
    padding: 0;
    width: 100%;
    background-color: inherit;
    padding: 0 0 48px;
  }

  h5 {
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

  ${LinkStyledButton} {
    opacity: 0.7;
    color: ${({ theme }) => theme.text1};

    &:hover {
      opacity: 1;
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
  background-color: ${({ theme }) => theme.networkCard.background};
  color: ${({ theme }) => theme.networkCard.text};
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
