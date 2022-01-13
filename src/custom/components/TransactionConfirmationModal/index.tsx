import { Currency } from '@uniswap/sdk-core'
import { useActiveWeb3React } from 'hooks/web3'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { SupportedChainId as ChainId } from 'constants/chains'
import React, { ReactNode, useContext, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components/macro'
import {
  CloseIcon,
  // CustomLightSpinner
} from 'theme'
import { t, Trans } from '@lingui/macro'
import { ExternalLink } from 'theme'
import { RowBetween, RowFixed } from 'components/Row'
import MetaMaskLogo from 'assets/images/metamask.png'
import { getEtherscanLink, getExplorerLabel } from 'utils'
import { Text } from 'rebass'
import { ArrowUpCircle, CheckCircle, UserCheck } from 'react-feather'
import useAddTokenToMetamask from 'hooks/useAddTokenToMetamask'
import GameIcon from 'assets/cow-swap/game.gif'
import { Link } from 'react-router-dom'
import { ConfirmationModalContent as ConfirmationModalContentMod } from './TransactionConfirmationModalMod'
import { ColumnCenter } from 'components/Column'
// import { lighten } from 'polished'
import { getStatusIcon } from 'components/AccountDetails'
import { shortenAddress } from 'utils'
import { getChainCurrencySymbols } from 'utils/xdai/hack'

const Wrapper = styled.div`
  width: 100%;
`

const Section = styled.div`
  padding: 24px;
  align-items: center;
  justify-content: flex-start;
  display: flex;
  flex-flow: column wrap;
`

const CloseIconWrapper = styled(CloseIcon)`
  display: flex;
  margin: 16px 16px 0 auto;
  opacity: 0.75;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }
`

const WalletIcon = styled.div`
  --icon-size: 54px;
  margin: 0 auto 21px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size);
  height: var(--icon-size);
  border-radius: var(--icon-size);

  > div {
    height: 100%;
    width: 100%;
    position: relative;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0;
  }

  > div > img,
  > div > div > svg {
    height: 100%;
    width: 100%;
    object-fit: contain;
  }

  > div > img[alt='Gnosis Safe Multisig logo'] {
    ${({ theme }) => theme.util.invertImageForDarkMode};
  }
`

const CloseLink = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.primary1};
  cursor: pointer;
  margin: 8px auto;
`

export const GPModalHeader = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 16px;
    background: ${({ theme }) => theme.bg1};
    z-index: 20;
  `}
`

const InternalLink = styled(Link)``

const StyledIcon = styled.img`
  height: auto;
  width: 20px;
  max-height: 100%;
  margin: 0 10px 0 0;
`

const ExternalLinkCustom = styled(ExternalLink)`
  margin: 12px auto 48px;
`

const ButtonGroup = styled.div`
  display: grid;
  align-items: center;
  justify-content: center;
  flex-flow: column wrap;
  margin: 12px 0 24px;
  width: 100%;
`

const ButtonCustom = styled.button`
  display: flex;
  flex: 1 1 auto;
  align-self: center;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  min-height: 52px;
  border: 1px solid ${({ theme }) => theme.border2};
  color: ${({ theme }) => theme.text1};
  background: transparent;
  outline: 0;
  padding: 8px 16px;
  margin: 16px 0 0;
  font-size: 14px;
  line-height: 1;
  font-weight: 500;
  transition: background 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.border2};
  }

  > a {
    display: flex;
    align-items: center;
    color: inherit;
    text-decoration: none;
  }
`

const CheckCircleCustom = styled(CheckCircle)`
  height: auto;
  width: 20px;
  max-height: 100%;
  margin: 0 10px 0 0;
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 16px 0 32px;
`

const UpperSection = styled.div`
  display: flex;
  flex-flow: column wrap;
  padding: 16px 0;

  > div {
    padding: 0;
  }
`

const LowerSection = styled.div`
  display: flex;
  flex-flow: column wrap;
  background: ${({ theme }) => theme.bg4};
  padding: 40px;
  margin: 16px auto 0;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 100%;
  `}

  > h3 {
    text-align: center;
    width: 100%;
    font-size: 21px;
    margin: 0 auto 42px;
  }

  > h3 > span:last-of-type {
    display: block;
    font-weight: 400;
  }
`

const StepsIconWrapper = styled.div`
  --circle-size: 65px;
  --border-radius: 100%;
  --border-size: 2px;
  border-radius: var(--circle-size);
  height: var(--circle-size);
  width: var(--circle-size);
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: var(--border-size);
    right: var(--border-size);
    bottom: var(--border-size);
    left: var(--border-size);
    z-index: -1;
    border-radius: calc(var(--border-radius) - var(--border-size));
    ${({ theme }) => theme.card.boxShadow};
  }

  > svg {
    height: 100%;
    width: 100%;
    padding: 18px;
    stroke: ${({ theme }) => theme.text1};
  }

  @keyframes spin {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

const StepsWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  position: relative;

  > div {
    flex: 0 1 35%;
    display: flex;
    flex-flow: column wrap;
    animation: SlideInStep 1s forwards linear;
    opacity: 0;
    transform: translateX(-5px);
    z-index: 2;
  }

  > div:first-child {
    ${StepsIconWrapper} {
      &::before {
        content: '';
        ${({ theme }) => theme.iconGradientBorder};
        display: block;
        width: var(--circle-size);
        padding: 0;
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        margin: auto;
        border-radius: 100%;
        z-index: -2;
        animation: spin 1.5s linear infinite;
      }
    }
  }

  > div:last-child {
    animation-delay: 1s;
  }

  > hr {
    flex: 1 1 auto;
    height: 1px;
    border: 0;
    background: ${({ theme }) => theme.border2};
    margin: auto;
    position: absolute;
    width: 100%;
    max-width: 162px;
    left: 0;
    right: 0;
    top: 32px;
    z-index: 1;
  }

  > hr::before {
    content: '';
    height: 4px;
    width: 100%;
    background: ${({ theme }) => theme.bg4};
    display: block;
    margin: 0;
    animation: Shrink 1s forwards linear;
    transform: translateX(0%);
  }

  > div > p {
    font-size: 13px;
    line-height: 1.4;
    text-align: center;
  }

  > div > p > span {
    opacity: 0.7;
  }

  @keyframes SlideInStep {
    from {
      opacity: 0;
      transform: translateX(-5px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes Shrink {
    from {
      transform: translateX(0%);
    }
    to {
      transform: translateX(100%);
    }
  }
`

export * from './TransactionConfirmationModalMod'
export { default } from './TransactionConfirmationModalMod'

export enum WalletType {
  SAFE,
  SC,
  EOA,
}

export enum OperationType {
  WRAP_ETHER,
  UNWRAP_WETH,
  APPROVE_TOKEN,
  ORDER_SIGN,
  ORDER_CANCEL,
}

function getWalletNameLabel(walletType: WalletType): string {
  switch (walletType) {
    case WalletType.SAFE:
      return 'Gnosis Safe'
    case WalletType.SC:
      return 'smart contract wallet'
    case WalletType.EOA:
      return 'wallet'
  }
}

function getOperationMessage(operationType: OperationType, chainId: number): string {
  const { native, wrapped } = getChainCurrencySymbols(chainId)

  switch (operationType) {
    case OperationType.WRAP_ETHER:
      return 'Wrapping ' + native
    case OperationType.UNWRAP_WETH:
      return 'Unwrapping ' + wrapped
    case OperationType.APPROVE_TOKEN:
      return 'Approving token'
    case OperationType.ORDER_CANCEL:
      return 'Soft canceling your order'

    default:
      return 'Almost there!'
  }
}

function getOperationLabel(operationType: OperationType): string {
  switch (operationType) {
    case OperationType.WRAP_ETHER:
      return t`wrapping`
    case OperationType.UNWRAP_WETH:
      return t`unwrapping`
    case OperationType.APPROVE_TOKEN:
      return t`token approval`
    case OperationType.ORDER_SIGN:
      return t`order`
    case OperationType.ORDER_CANCEL:
      return t`cancellation`
  }
}

function getSubmittedMessage(operationLabel: string, operationType: OperationType): string {
  switch (operationType) {
    case OperationType.ORDER_SIGN:
      return t`The order is submitted and ready to be settled.`
    default:
      return t`The ${operationLabel} is submitted.`
  }
}

export function ConfirmationPendingContent({
  onDismiss,
  pendingText,
  operationType,
  chainId,
}: {
  onDismiss: () => void
  pendingText: ReactNode
  operationType: OperationType
  chainId: number
}) {
  const { connector } = useActiveWeb3React()
  const walletInfo = useWalletInfo()
  const { ensName, account, isSmartContractWallet, gnosisSafeInfo } = useWalletInfo()

  const walletType = useMemo((): WalletType => {
    if (gnosisSafeInfo) {
      return WalletType.SAFE
    } else if (isSmartContractWallet) {
      return WalletType.SC
    } else {
      return WalletType.EOA
    }
  }, [gnosisSafeInfo, isSmartContractWallet])

  const walletNameLabel = getWalletNameLabel(walletType)
  const operationMessage = getOperationMessage(operationType, chainId)
  const operationLabel = getOperationLabel(operationType)
  const operationSubmittedMessage = getSubmittedMessage(operationLabel, operationType)

  return (
    <Wrapper>
      <UpperSection>
        <CloseIconWrapper onClick={onDismiss} />

        <WalletIcon>{getStatusIcon(connector, walletInfo, 46)}</WalletIcon>

        <Text fontWeight={500} fontSize={16} textAlign="center">
          {pendingText}
        </Text>
      </UpperSection>

      <LowerSection>
        <h3>
          <span>{operationMessage} </span>
          <span>
            <Trans>Follow these steps:</Trans>
          </span>
        </h3>

        <StepsWrapper>
          <div>
            <StepsIconWrapper>
              <UserCheck />
            </StepsIconWrapper>
            <p>
              <Trans>
                Sign the {operationLabel} with your {walletNameLabel}{' '}
                {account && <span>({ensName || shortenAddress(account)})</span>}
              </Trans>
            </p>
          </div>
          <hr />
          <div>
            <StepsIconWrapper>
              <CheckCircle />
            </StepsIconWrapper>
            <p>{operationSubmittedMessage}</p>
          </div>
        </StepsWrapper>
      </LowerSection>
    </Wrapper>
  )
}

export function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
}: {
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
  currencyToAdd?: Currency | undefined
}) {
  const theme = useContext(ThemeContext)
  const { library } = useActiveWeb3React()
  const { addToken, success } = useAddTokenToMetamask(currencyToAdd)

  return (
    <Wrapper>
      <Section>
        <CloseIconWrapper onClick={onDismiss} />

        <ConfirmedIcon>
          <ArrowUpCircle strokeWidth={0.5} size={90} color={theme.primary1} />
        </ConfirmedIcon>

        <Text fontWeight={500} fontSize={20}>
          Transaction Submitted
        </Text>

        {chainId && hash && (
          <ExternalLinkCustom href={getEtherscanLink(chainId, hash, 'transaction')}>
            <Text fontWeight={500} fontSize={14} color={theme.primary1}>
              {getExplorerLabel(chainId, hash, 'transaction')} ↗
            </Text>
          </ExternalLinkCustom>
        )}

        <ButtonGroup>
          {currencyToAdd && library?.provider?.isMetaMask && (
            <ButtonCustom onClick={addToken}>
              {!success ? (
                <RowFixed>
                  <StyledIcon src={MetaMaskLogo} /> Add {currencyToAdd.symbol} to Metamask
                </RowFixed>
              ) : (
                <RowFixed>
                  <CheckCircleCustom size={'16px'} stroke={theme.green1} />
                  Added {currencyToAdd.symbol}{' '}
                </RowFixed>
              )}
            </ButtonCustom>
          )}

          {/* 
          <ButtonCustom>
            <InternalLink to="/play/cow-runner" onClick={onDismiss}>
              <StyledIcon src={GameIcon} alt="Play CowGame" />
              Play the Cow Runner Game!
            </InternalLink>
          </ButtonCustom> 
          */}
          <ButtonCustom>
            <InternalLink to="/play/mev-slicer" onClick={onDismiss}>
              <StyledIcon src={GameIcon} alt="Play Cow Slicer Game" />
              Play the Cow Slicer Game!
            </InternalLink>
          </ButtonCustom>
        </ButtonGroup>

        <CloseLink onClick={onDismiss}>Close</CloseLink>
      </Section>
    </Wrapper>
  )
}

export interface ConfirmationModalContentProps {
  title: ReactNode
  onDismiss: () => void
  topContent: () => ReactNode
  bottomContent?: () => ReactNode | undefined
}

export function ConfirmationModalContent(props: ConfirmationModalContentProps) {
  return <ConfirmationModalContentMod {...props} />
}
