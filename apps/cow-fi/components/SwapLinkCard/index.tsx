import { SwapCard } from '@/components/TokenDetails/index.styles'

type SwapLinkCardProps = {
  contractAddress: string
  networkId: number
  networkName: string
  tokenSymbol: string
}

export const SwapLinkCard = ({ contractAddress, networkId, networkName, tokenSymbol }: SwapLinkCardProps) => {
  return (
    contractAddress && (
      <SwapCard>
        <a
          href={`https://swap.cow.fi/#/${networkId}/swap/${
            networkId === 100 ? 'WXDAI' : 'WETH'
          }/${contractAddress}?sellAmount=1`}
          target="_blank"
          rel="nofollow noreferrer"
        >
          <img
            src={`/images/${(networkName === 'Gnosis Chain' ? 'gnosis-chain' : networkName).toLowerCase()}.svg`}
            alt={networkName}
          />
          <b>
            Swap {tokenSymbol} <br /> on {networkName}
          </b>
          <img src="/images/external-arrow.svg" alt="Go to CoW Swap" />
        </a>
      </SwapCard>
    )
  )
}
