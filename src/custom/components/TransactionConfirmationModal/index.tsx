import { Currency } from '@uniswap/sdk-core'
import { useActiveWeb3React } from 'hooks/web3'
import { SupportedChainId as ChainId } from 'constants/chains'
import React, { ReactNode, useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { CloseIcon } from 'theme'
import { ExternalLink } from 'theme'
import { RowBetween, RowFixed } from 'components/Row'
import MetaMaskLogo from 'assets/images/metamask.png'
import { getEtherscanLink, getExplorerLabel } from 'utils'
import { Text } from 'rebass'
import { ArrowUpCircle, CheckCircle } from 'react-feather'
import useAddTokenToMetamask from 'hooks/useAddTokenToMetamask'
import GameIcon from 'assets/cow-swap/game.gif'
import { Link } from 'react-router-dom'
import { ConfirmationModalContent as ConfirmationModalContentMod } from './TransactionConfirmationModalMod'

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
  margin: 0 0 0 auto;
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

const ConfirmedIcon = styled.div`
  padding: 16px 0;
`

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

export * from './TransactionConfirmationModalMod'
export { default } from './TransactionConfirmationModalMod'

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

          <ButtonCustom>
            <InternalLink to="/play" onClick={onDismiss}>
              <StyledIcon src={GameIcon} alt="Play CowGame" />
              Play the CowGame!
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
