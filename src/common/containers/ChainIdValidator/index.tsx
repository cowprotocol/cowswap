import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWeb3React } from '@web3-react/core'

import styled from 'styled-components/macro'

import { BaseButton } from 'legacy/components/Button'

import { useDisconnectWallet } from 'modules/wallet'

import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'
import { InlineBanner } from 'common/pure/InlineBanner'
import { NetworksList } from 'common/pure/NetworksList'

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
  margin: 0 auto;
  max-width: 400px;
`

const ActionButton = styled(BaseButton)`
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.border2};
  border-radius: 10px;

  &:hover {
    opacity: 0.9;
  }
`

const Title = styled.h3`
  font-size: 18px;
`

export function ChainIdValidator({ children }: { children: JSX.Element }) {
  const { chainId } = useWeb3React()
  const isChainIdUnsupported = !!chainId && !(chainId in SupportedChainId)

  const onSelectChain = useOnSelectNetwork()
  const disconnectWallet = useDisconnectWallet()

  if (isChainIdUnsupported) {
    return (
      <ListWrapper>
        <div>
          <InlineBanner type="danger">
            Your wallet is connected to unsupported network with ID: <strong>{chainId}</strong>
          </InlineBanner>
          <Title>Please connect your wallet to one of our supported networks</Title>

          <NetworksList currentChainId={chainId} onSelectChain={onSelectChain} />
          <br />
          <ActionButton onClick={disconnectWallet}>Disconnect wallet</ActionButton>
        </div>
      </ListWrapper>
    )
  }

  return children
}
