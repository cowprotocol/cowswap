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
  const { address, symbol, decimals, name } = platformData

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
        {/* <a
          href={`https://link.trustwallet.com/add_asset?asset=c20000714&t=${address}&n=${name}&s=${symbol}&d=${decimals}`}
          target="_blank"
          rel="noreferrer nofollow"
        >
          <img src="/images/trust_platform.svg" alt="Add to Trust Wallet" />
        </a>

        <a
          href={`https://metamask.app.link/addToken?contractAddress=${address}&symbol=${symbol}&decimals=${decimals}&name=${name}`}
          target="_blank"
          rel="noreferrer nofollow"
        >
          <img src="/images/metamask-fox.svg" alt="Add to Metamask" />
        </a> */}
      </span>
    </ItemWrapper>
  )
}
