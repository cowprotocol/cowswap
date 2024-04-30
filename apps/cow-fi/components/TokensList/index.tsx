import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TokenLink } from '@/components/TokenDetails/index.styles'
import { getPriceChangeColor } from 'util/getPriceChangeColor'
import { formatUSDPrice } from 'util/formatUSDPrice'
import { TokenInfo } from 'types'
import {
  HeaderItem,
  ListItem,
  ListItemValue,
  PlacerholderImage,
  SearchTokens,
  TokenTable,
  Wrapper,
  NoTokensText,
} from './index.style'

export interface TokenListProps {
  tokens: TokenInfo[]
}

export function TokenList({ tokens }: TokenListProps) {
  const [search, setSearch] = useState('')
  const [filteredTokens, setFilteredTokens] = useState(tokens)

  useEffect(() => {
    setFilteredTokens(
      tokens.filter(
        (token) =>
          token.name.toLowerCase().includes(search.toLowerCase()) ||
          token.symbol.toLowerCase().includes(search.toLowerCase())
      )
    )
  }, [search, tokens])

  return (
    <Wrapper>
      <h1>
        Tokens <span>({filteredTokens.length})</span>
      </h1>
      <SearchTokens
        type="text"
        placeholder="Search tokens..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <TokenTable>
        <HeaderItem>
          <div>#</div>
          <div>Name</div>
          <div>Price</div>
          <div>Change</div>
          <div>Market Cap</div>
          <div>Volume</div>
        </HeaderItem>
        {filteredTokens.length ? (
          filteredTokens.map((token, index) => <TokenItem key={token.id} token={token} index={index} />)
        ) : (
          <NoTokensText>No tokens found</NoTokensText>
        )}
      </TokenTable>
    </Wrapper>
  )
}

interface TokenItemProps {
  token: TokenInfo
  index: number
}

function TokenItem({ token, index }: TokenItemProps) {
  const { id, name, symbol, change24h, priceUsd, marketCap, volume, image } = token
  return (
    <ListItem key={id}>
      <span>{index + 1}</span>

      <Link href={`/tokens/${id}`} passHref>
        <TokenLink>
          {image.large && image.large !== 'missing_large.png' ? (
            <img src={image.large} alt={name} />
          ) : (
            <PlacerholderImage />
          )}
          <span>
            {name} <i>({symbol})</i>
          </span>
        </TokenLink>
      </Link>

      <ListItemValue>{priceUsd ? `$${priceUsd}` : '-'}</ListItemValue>
      <ListItemValue color={getPriceChangeColor(change24h)}>
        {change24h ? `${Number(change24h).toFixed(2)}%` : '-'}
      </ListItemValue>
      <ListItemValue>{marketCap ? `${formatUSDPrice(marketCap)}` : '-'}</ListItemValue>
      <ListItemValue>{volume ? `${formatUSDPrice(volume)}` : '-'}</ListItemValue>
    </ListItem>
  )
}
