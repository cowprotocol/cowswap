import { TokenWithLogo } from '@cowprotocol/common-const'
import { useCopyClipboard } from '@cowprotocol/common-hooks'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenName, TokenSymbol } from '@cowprotocol/ui'

import { getEtherscanLink, shortenAddress } from 'libs/common-utils/src/legacyAddressUtils'
import { getExplorerAddressLink } from 'libs/common-utils/src/explorer'
import CopyHelper from 'legacy/components/Copy/CopyMod'

import * as styledEl from './styled'

export interface TokenInfoProps {
  token: TokenWithLogo
  className?: string
}

export function TokenInfo(props: TokenInfoProps) {
  const { token, className } = props
  const [isCopied, setCopied] = useCopyClipboard()
  
  const handleAddressClick = (event: React.MouseEvent) => {
    // Prevent the event from propagating to avoid triggering token selection
    event.stopPropagation()
  }

  return (
    <styledEl.Wrapper className={className}>
      <TokenLogo token={token} sizeMobile={32} />
      <styledEl.TokenDetails>
        <TokenSymbol token={token} />
        <styledEl.TokenName>
          <TokenName token={token} />
        </styledEl.TokenName>
        {token.address && (
          <styledEl.AddressContainer>
            <styledEl.Address 
              href={getExplorerAddressLink(token.chainId, token.address)} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={handleAddressClick}
            >
              {shortenAddress(token.address)}
            </styledEl.Address>
            <styledEl.CopyIconWrapper onClick={handleAddressClick}>
              <CopyHelper toCopy={token.address} />
            </styledEl.CopyIconWrapper>
          </styledEl.AddressContainer>
        )}
      </styledEl.TokenDetails>
    </styledEl.Wrapper>
  )
}
