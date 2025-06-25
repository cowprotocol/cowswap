import { JSX, useMemo } from 'react'

import Image from 'next/image'

import { CopyToClipboard } from '@/components/CopyToClipboard'
import { NETWORK_IMAGE_MAP, NETWORK_MAP, NETWORK_URL_MAP } from '@/const/networkMap'

import { ItemWrapper } from './styles'

type PlatformData = {
  address: string
  symbol: string
  decimals: number
  name: string
}

type Props = {
  network: keyof typeof NETWORK_MAP
  platformData: PlatformData
}

export function NetworkItem(props: Props): JSX.Element {
  const { network, platformData } = props
  const { address, symbol, name } = platformData

  const networkUrl = useMemo(() => `${NETWORK_URL_MAP[network]}/${address}`, [network, address])
  const networkImage = useMemo(() => NETWORK_IMAGE_MAP[network], [network])
  const networkName = useMemo(() => NETWORK_MAP[network], [network])

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
