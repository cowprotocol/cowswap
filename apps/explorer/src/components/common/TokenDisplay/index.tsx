import { TokenErc20 } from '@gnosis.pm/dex-js'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { Network } from 'types'
import { abbreviateString, getImageAddress, isNativeToken } from 'utils'

import { Wrapper, NativeWrapper, StyledImg } from './styled'

export type Props = { erc20: TokenErc20; network: Network; showAbbreviated?: boolean }

export function TokenDisplay(props: Readonly<Props>): React.ReactNode {
  const { erc20, network, showAbbreviated } = props

  let tokenLabel
  if (showAbbreviated) {
    tokenLabel = `${erc20.symbol ?? erc20.name ?? abbreviateString(erc20.address, 6, 4)}` // Abbreviated
  } else if (erc20.name && erc20.symbol) {
    tokenLabel = `${erc20.name} (${erc20.symbol})` // Name and symbol
  } else if (!erc20.name && erc20.symbol) {
    tokenLabel = (
      <>
        <i>{abbreviateString(erc20.address, 6, 4)}</i> ({erc20.symbol})
      </>
    ) // No name, but symbol exists
  } else if (!erc20.name && !erc20.symbol && erc20.address) {
    tokenLabel = <i>{abbreviateString(erc20.address, 6, 4)}</i> // No name, no symbol, just address
  } else {
    tokenLabel = ''
  }

  const imageAddress = getImageAddress(erc20.address, network)

  return (
    <Wrapper>
      <StyledImg address={imageAddress} network={network} />
      {isNativeToken(erc20.address) ? (
        // There's nowhere to link when it's a native token, so, only display the symbol
        <NativeWrapper>{erc20.symbol}</NativeWrapper>
      ) : (
        <BlockExplorerLink identifier={erc20.address} type="token" label={tokenLabel} networkId={network} />
      )}
    </Wrapper>
  )
}
