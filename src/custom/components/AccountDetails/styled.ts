import styled from 'styled-components'
import { CopyIcon, TransactionStatusText } from 'components/Copy'
import { LinkStyledButton } from 'theme'
import { NetworkCard as NetworkCardUni } from 'components/Header/HeaderMod'
import {
  WalletName,
  AccountSection as AccountSectionMod,
  AccountGroupingRow as AccountGroupingRowMod,
  UpperSection as UpperSectionMod,
  AddressLink,
  TransactionListWrapper,
  AccountControl,
} from './AccountDetailsMod'
import { transparentize } from 'polished'

export const WalletActions = styled.div`
  display: flex;
  margin: 10px 0 0;
`

export const WalletLowerActions = styled.div`
  width: 100%;
  padding: 12px;
  border-radius: 21px;
  justify-content: space-evenly;
  ${({ theme }) => theme.neumorphism.boxShadow}
  margin: 16px 0 0;

  > a {
    align-items: center;
  }
`

export const WalletNameAddress = styled.div`
  width: 100%;
  font-size: 21px;
`

export const Wrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  color: ${({ theme }) => theme.text1};
  padding: 0;
  height: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 42px 0 0;`};

  ${WalletName},
  ${AddressLink},
  ${CopyIcon} {
    color: ${({ theme }) => theme.text1};
    opacity: 0.7;
    transition: color 0.2s ease-in-out, opacity 0.2s ease-in-out;
    margin: 0;

    &:hover {
      opacity: 1;
    }
  }

  ${TransactionStatusText} {
    order: 2;
    margin: 0 0 0 8px;
    align-self: center;
    font-size: 21px;
  }

  ${WalletName} {
    text-align: right;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      width: 100%;
      text-align: center;
      justify-content: center;
      margin: 0 auto 12px;
    `};
  }

  ${TransactionListWrapper} {
    padding: 0;
    width: 100%;
    flex-flow: column wrap;
  }

  ${AccountControl} ${WalletActions} {
    ${({ theme }) => theme.mediaWidth.upToSmall`
        flex-flow: column wrap;
        width: 100%;
    `};
  }
`

export const NetworkCard = styled(NetworkCardUni)`
  background-color: ${({ theme }) => theme.networkCard.background};
  color: ${({ theme }) => theme.networkCard.text};
  padding: 6px 8px;
  font-size: 13px;
  margin: 0 8px 0 0;
  letter-spacing: 0.7px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-shrink: 0;
  `};
`

export const UpperSection = styled(UpperSectionMod)`
  flex: 1 1 auto;
  width: 100%;
`

export const InfoCard = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  margin: 0;
  border-radius: 0;
  padding: 16px 16px 24px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding: 16px 10px 24px;
  `};
`

export const AccountSection = styled(AccountSectionMod)`
  padding: 0;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0;`};
`

export const AccountGroupingRow = styled(AccountGroupingRowMod)`
  > div {
    flex-flow: column wrap;
    justify-content: flex-start;
    align-items: center;
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
  background-color: ${({ theme }) => theme.bg6};
  border-radius: 0;
  height: 100%;
  width: 100%;
  align-items: flex-start;
  justify-content: flex-start;

  > span {
    display: flex;
    color: ${({ theme }) => theme.text1};
    justify-content: space-between;
    padding: 8px 16px;
    border-bottom: 1px solid ${({ theme }) => theme.bg3};
    position: sticky;
    top: 38px;
    background: ${({ theme }) => transparentize(0.75, theme.bg6)};
    backdrop-filter: blur(5px);
    z-index: 10;
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
    padding: 0 0 100px;
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
