import { ReactNode } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { COW_TOKEN_MAINNET, TokenWithLogo, USDC_MAINNET } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { ChevronRight } from 'react-feather'
import { useParams } from 'react-router'

import { getUsdPriceStateKey, useUsdPrices } from 'modules/usdAmount'

import { Routes } from 'common/constants/routes'

import { ChevronWrapper, LinkStyled, Title, TokenListItemStyled, Wrapper } from './styled'

import { AccountCard } from '../../pure/AccountCard'
import { parameterizeRoute } from '../../utils/parameterizeRoute'

const tokens = [USDC_MAINNET, COW_TOKEN_MAINNET] as TokenWithLogo[]

export function AccountProxyPage(): ReactNode {
  const { chainId } = useWalletInfo()
  const { proxyAddress } = useParams()
  const usdPrices = useUsdPrices(tokens)
  const { values: balances } = useTokensBalances()

  if (!proxyAddress) return null

  return (
    <Wrapper>
      <AccountCard chainId={chainId} account={proxyAddress} />
      <Title>Recoverable tokens · {tokens.length}</Title>
      {tokens.map((token) => {
        const balance = balances[token.address.toLowerCase()]
        const usdPrice = usdPrices[getUsdPriceStateKey(token)]

        return (
          <LinkStyled
            key={token.address}
            to={parameterizeRoute(Routes.ACCOUNT_PROXY_RECOVER, { chainId, proxyAddress, tokenAddress: token.address })}
          >
            <TokenListItemStyled token={token} isWalletConnected balance={balance} usdPrice={usdPrice}>
              <ChevronWrapper>
                <ChevronRight size={24} />
              </ChevronWrapper>
            </TokenListItemStyled>
          </LinkStyled>
        )
      })}
    </Wrapper>
  )
}
