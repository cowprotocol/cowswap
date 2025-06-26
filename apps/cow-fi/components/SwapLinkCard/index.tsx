import { JSX } from 'react'

import Image from 'next/image'

import { SwapCard } from '@/components/TokenDetails/index.styles'
import { Network, NETWORK_IMAGE_MAP, NETWORK_MAP } from '@/const/networkMap'

type SwapLinkCardProps = {
  contractAddress: string
  networkId: number
  network: Network
  tokenSymbol: string
}

export const SwapLinkCard = ({
  contractAddress,
  networkId,
  network,
  tokenSymbol,
}: SwapLinkCardProps): JSX.Element | null => {
  const networkImage = NETWORK_IMAGE_MAP[network]

  return contractAddress ? (
    <SwapCard>
      <a
        href={`https://swap.cow.fi/#/${networkId}/swap/${
          networkId === 100 ? 'WXDAI' : 'WETH'
        }/${contractAddress}?sellAmount=1`}
        target="_blank"
        rel="nofollow noreferrer"
      >
        <Image src={networkImage} alt={NETWORK_MAP[network]} width={16} height={16} />
        <b>
          Swap {tokenSymbol} <br /> on {NETWORK_MAP[network]}
        </b>
        <Image src="/images/external-arrow.svg" alt="Go to CoW Swap" width={16} height={16} />
      </a>
    </SwapCard>
  ) : null
}
