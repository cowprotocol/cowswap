import { Confetti } from '@cowprotocol/ui'
import styled from 'styled-components/macro'
import { darken, transparentize } from 'polished'
import { useConnectAndAddToWallet } from '../../lib/hooks/useConnectAndAddToWallet'
import { clickOnMevBlocker } from 'modules/analytics'
import { useAccount } from 'wagmi'

import { Link, LinkType } from '@/components/Link'
import { AddToWalletStateValues } from '../../types/addToWalletState'

const Message = styled.p<{ state: AddToWalletStateValues }>`
  color: ${({ state }) => (state === 'added' ? darken(0.5, 'green') : 'orange')};
  font-weight: bold;
  width: 100%;
  margin: 2.4rem 0 0;
  background: ${({ state }) => (state === 'added' ? transparentize(0.8, 'green') : transparentize(0.9, 'orange'))};
  padding: 1rem;
  border-radius: 1.2rem;
  text-align: center;
`

export function AddRpcButton() {
  const { addWalletState, connectAndAddToWallet, disconnectWallet } = useConnectAndAddToWallet()
  const { errorMessage, state } = addWalletState
  const { isConnected } = useAccount()

  const handleClick = async () => {
    clickOnMevBlocker('click-add-rpc-to-wallet')
    try {
      if (connectAndAddToWallet) {
        // Start the connection process
        const connectionPromise = connectAndAddToWallet()

        // Wait for the connection process to complete
        await connectionPromise
      } else {
        throw new Error('connectAndAddToWallet is not defined')
      }
    } catch (error) {
      clickOnMevBlocker('click-add-rpc-to-wallet-error')
    }
  }

  // Get the label and enable state of button
  const isAdding = state === 'adding'
  const isConnecting = state === 'connecting'
  const disabledButton = isConnecting || isAdding || !connectAndAddToWallet
  const buttonLabel = isConnecting
    ? 'Connecting Wallet...'
    : isAdding
      ? 'Adding to Wallet...'
      : isConnected
        ? 'Add MEV Blocker RPC'
        : 'Get protected'

  return (
    <>
      {state === 'added' ? (
        <>
          <Confetti start={true} />
          <Message state={state}>Added to your wallet! You are now safe!</Message>
        </>
      ) : (
        <>
          <Link
            linkType={LinkType.TopicButton}
            fontSize={21}
            color={'#FEE7CF'}
            bgColor="#EC4612"
            onClick={handleClick}
            disabled={disabledButton}
            asButton
          >
            {buttonLabel}
          </Link>
          {errorMessage && <Message state={state}>{errorMessage}</Message>}
          {disconnectWallet && (
            <Link
              linkType={LinkType.TopicButton}
              fontSize={21}
              color={'#FEE7CF'}
              bgColor="#333"
              onClick={disconnectWallet}
              asButton
            >
              Disconnect
            </Link>
          )}
        </>
      )}
    </>
  )
}
