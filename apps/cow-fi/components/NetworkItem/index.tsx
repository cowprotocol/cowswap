import { CopyToClipboard } from '@/components/CopyToClipboard'
import { ItemWrapper } from './styles'

type PlatformData = {
  address: string
  symbol: string
  decimals: number
  name: string
}

type Props = {
  network: string
  platformData: PlatformData
}

export function NetworkItem(props: Props) {
  const { network, platformData } = props
  const { address, symbol, name } = platformData

  return (
    <ItemWrapper>
      <a
        href={
          network === 'xdai' ? `https://gnosisscan.io/address/${address}` : `https://etherscan.io/address/${address}`
        }
        title={`${name} (${symbol}) on ${network === 'xdai' ? 'Gnosis Chain' : 'Ethereum'}`}
        target="_blank"
        rel="noreferrer nofollow"
      >
        <img
          src={`/images/${network === 'xdai' ? 'gnosis-chain' : network}.svg`}
          alt={network === 'xdai' ? 'Gnosis Chain' : 'Ethereum'}
        />
        {network === 'xdai' ? 'Gnosis Chain' : network.charAt(0).toUpperCase() + network.slice(1)}
      </a>
      <a
        href={
          network === 'xdai' ? `https://gnosisscan.io/address/${address}` : `https://etherscan.io/address/${address}`
        }
        title={`${name} (${symbol}) on ${network === 'xdai' ? 'Gnosis Chain' : 'Ethereum'}`}
        target="_blank"
        rel="noreferrer nofollow"
      >
        <div>
          <i>{address}</i>
          <img src="/images/external-arrow.svg" alt="Go to explorer" />
        </div>
      </a>
      <span>
        <CopyToClipboard text={address} />
      </span>
    </ItemWrapper>
  )
}
