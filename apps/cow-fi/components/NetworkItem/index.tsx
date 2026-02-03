import { JSX } from 'react'

import Image from 'next/image'

import { ItemWrapper } from './styles'

import { CopyToClipboard } from '@/components/CopyToClipboard'
import { Network, NETWORK_IMAGE_MAP, NETWORK_MAP, NETWORK_URL_MAP } from '@/const/networkMap'

type PlatformData = {
  address: string
  symbol: string
  decimals: number
  name: string
}

type Props = {
  network: Network
  platformData: PlatformData
}

export function NetworkItem(props: Props): JSX.Element {
  const { network, platformData } = props
  const { address, symbol, name } = platformData

  const networkUrl = `${NETWORK_URL_MAP[network]}/${address}`
  const networkImage = NETWORK_IMAGE_MAP[network]
  const networkName = NETWORK_MAP[network]

  return (
    <ItemWrapper>
      <a href={networkUrl} title={`${name} (${symbol}) on ${networkName}`} target="_blank" rel="noreferrer nofollow">
        <Image src={networkImage} alt={networkName} width={16} height={16} />
        {networkName}
      </a>
      <a href={networkUrl} title={`${name} (${symbol}) on ${networkName}`} target="_blank" rel="noreferrer nofollow">
        <div>
          <i>{address}</i>
          <Image src="/images/external-arrow.svg" alt="Go to explorer" width={16} height={16} />
        </div>
      </a>
      <span>
        <CopyToClipboard text={address} />
      </span>
    </ItemWrapper>
  )
}
