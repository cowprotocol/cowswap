import { TokenSymbol } from '@cowprotocol/ui'

import { ExternalLink, Slash, Trash } from 'react-feather'

import { TokenWithLogo } from '../../types'

export interface ManageTokensProps {
  tokens: TokenWithLogo[]
}

export function ManageTokens(props: ManageTokensProps) {
  const { tokens } = props

  return (
    <div>
      <input type="text" placeholder="0x0000" />
      <div>
        <div>
          <div>{tokens.length} Custom Tokens</div>
          <button>Clear all</button>
        </div>
        <div>
          {tokens.map((token) => {
            return (
              <div key={token.address}>
                <div>
                  <img src={token.logoURI} alt={token.name} width={36} height={36} />
                  <Slash />
                  <TokenSymbol token={token} />
                </div>
                <div>
                  <button>
                    <Trash />
                  </button>
                  <button>
                    <ExternalLink />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <div>
          <p>Tip: Custom tokens are stored locally in your browser</p>
        </div>
      </div>
    </div>
  )
}
