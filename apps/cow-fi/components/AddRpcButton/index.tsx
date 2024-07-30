import { Confetti } from '@cowprotocol/ui'
import styled from 'styled-components/macro'
import { darken, transparentize } from 'polished'
import { useConnectAndAddToWallet } from '../../lib/hooks/useConnectAndAddToWallet'
import { clickOnMevBlocker } from 'modules/analytics'

import { Link, LinkType } from '@/components/Link'

export type AddToWalletStateValues = 'unknown' | 'adding' | 'added' | 'error' | 'takingTooLong' | 'connecting'

export interface AddToWalletState {
  state: AddToWalletStateValues
  errorMessage?: string
  autoConnect: boolean
}

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

  const handleClick = async () => {
    clickOnMevBlocker('click-add-rpc-to-wallet')
    try {
      if (connectAndAddToWallet) {
        clickOnMevBlocker('click-add-rpc-to-wallet-connecting')

        // Start the connection process
        const connectionPromise = connectAndAddToWallet()

        // Wait for the connection process to complete
        await connectionPromise

        // At this point, the user has either connected their wallet or cancelled
        if (addWalletState.state === 'added') {
          clickOnMevBlocker('click-add-rpc-to-wallet-connected')
          clickOnMevBlocker('click-add-rpc-to-wallet-success')
        } else if (addWalletState.state === 'unknown') {
          // The user likely cancelled the connection
          clickOnMevBlocker('click-add-rpc-to-wallet-cancelled')
        } else {
          // Connected but RPC not added yet
          clickOnMevBlocker('click-add-rpc-to-wallet-connected')
        }
      } else {
        throw new Error('connectAndAddToWallet is not defined')
      }
    } catch (error) {
      clickOnMevBlocker('click-add-rpc-to-wallet-error')
    }
  }

  const handleDisconnect = () => {
    if (disconnectWallet) {
      disconnectWallet()
    }
  }

  // Get the label and enable state of button
  const isAdding = state === 'adding'
  const isConnecting = state === 'connecting'
  const disabledButton = isConnecting || isAdding || !connectAndAddToWallet
  const buttonLabel = isConnecting ? 'Connecting Wallet...' : isAdding ? 'Adding to Wallet...' : 'Get protected'

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
              onClick={handleDisconnect}
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
