import { Confetti, Color } from '@cowprotocol/ui'
import { CowFiCategory, toCowFiGtmEvent } from 'src/common/analytics/types'
import styled from 'styled-components/macro'
import { darken, transparentize } from 'polished'
import { useConnectAndAddToWallet } from '../../lib/hooks/useConnectAndAddToWallet'
import { useAccount } from 'wagmi'
import { useCowAnalytics } from '@cowprotocol/analytics'

import { Link, LinkType } from '@/components/Link'
import { AddToWalletStateValues } from '../../types/addToWalletState'

const Message = styled.p<{ state: AddToWalletStateValues }>`
  color: ${({ state }) => (state === 'added' ? darken(0.5, Color.cowfi_green) : Color.cowfi_orange_bright)};
  font-weight: bold;
  width: 100%;
  margin: 2.4rem 0 0;
  background: ${({ state }) =>
    state === 'added' ? transparentize(0.8, Color.cowfi_green) : transparentize(0.9, Color.cowfi_orange_bright)};
  padding: 1rem;
  border-radius: 1.2rem;
  text-align: center;
`

export function AddRpcButton() {
  const { addWalletState, connectAndAddToWallet, disconnectWallet } = useConnectAndAddToWallet()
  const { errorMessage, state } = addWalletState
  const { isConnected } = useAccount()
  const cowAnalytics = useCowAnalytics()

  const handleClick = async () => {
    // We keep direct analytics for error tracking as it needs more context
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
      // Use direct analytics for error tracking to include more context
      cowAnalytics.sendEvent({
        category: CowFiCategory.MEVBLOCKER,
        action: 'Error Add RPC',
        label: error instanceof Error ? error.message : 'Unknown error',
      })
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
            color={Color.cowfi_orange_pale}
            bgColor={Color.cowfi_orange_bright}
            onClick={handleClick}
            disabled={disabledButton}
            asButton
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.MEVBLOCKER,
              action: 'Click Add RPC',
              label: isConnected ? 'Add MEV Blocker RPC' : 'Get Protected',
            })}
          >
            {buttonLabel}
          </Link>
          {errorMessage && <Message state={state}>{errorMessage}</Message>}
          {disconnectWallet && (
            <Link
              linkType={LinkType.TopicButton}
              fontSize={21}
              color={Color.cowfi_orange_pale}
              bgColor={Color.neutral20}
              onClick={disconnectWallet}
              asButton
              data-click-event={toCowFiGtmEvent({
                category: CowFiCategory.MEVBLOCKER,
                action: 'Click Disconnect',
              })}
            >
              Disconnect
            </Link>
          )}
        </>
      )}
    </>
  )
}
