import { Confetti } from '@cowprotocol/ui'
import styled from 'styled-components/macro'
import { darken, transparentize } from 'polished'
import { useConnectAndAddToWallet } from '../../lib/hooks/useConnectAndAddToWallet'

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
  const { addWalletState, connectAndAddToWallet } = useConnectAndAddToWallet()
  const { errorMessage, state } = addWalletState

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
            onClick={connectAndAddToWallet || (() => {})}
            disabled={disabledButton}
            asButton
          >
            {buttonLabel}
          </Link>
          {errorMessage && <Message state={state}>{errorMessage}</Message>}
        </>
      )}
    </>
  )
}
