import React from 'react'
import styled from 'styled-components'
import { Currency, CurrencyAmount } from '@uniswap/sdk'
import { LONG_PRECISION } from 'constants/index'
import CurrencyListMod, { StyledBalanceText, Tag as TagMod, TagContainer } from './CurrencyListMod'
import { MouseoverTooltip } from 'components/Tooltip'
import { TagInfo, WrappedTokenInfo } from 'state/lists/hooks'
import { Link } from 'react-router-dom'

const UNSUPPORTED_TOKEN_TAG = [
  {
    name: 'Unsupported',
    description:
      'This token is unsupported as it does not operate efficiently with Gnosis Protocol. Please refer to the FAQ for more information.',
    id: '0'
  }
]

const FAQ_URL = '/faq#what-are-unsupported-tokens'

const Tag = styled(TagMod)<{ bg?: string }>`
  background-color: ${({ bg, theme }) => bg || theme.bg3};
  max-width: 6.1rem;
`

const TagLink = styled(Tag)`
  display: flex;
  align-items: center;
  background-color: #3f77ff;
  font-size: x-small;
  a {
    color: white;
    font-weight: bold;
  }
`

function TagDescriptor({ tags, bg, children }: { children?: React.ReactNode; tags: TagInfo[]; bg?: string }) {
  const tag = tags[0]
  return (
    <TagContainer>
      <MouseoverTooltip text={tag.description}>
        <Tag bg={bg} key={tag.id}>
          {tag.name}
        </Tag>
      </MouseoverTooltip>
      {tags.length > 1 ? (
        <MouseoverTooltip
          text={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join('; \n')}
        >
          <Tag>...</Tag>
        </MouseoverTooltip>
      ) : null}
      {children}
    </TagContainer>
  )
}

function TokenTags({ currency, isUnsupported }: { currency: Currency; isUnsupported: boolean }) {
  if (isUnsupported) {
    return (
      <TagDescriptor bg="#f3a1a1" tags={UNSUPPORTED_TOKEN_TAG}>
        <TagLink>
          <Link to={FAQ_URL} target="_blank" onClick={e => e.stopPropagation()}>
            FAQ
          </Link>
        </TagLink>
      </TagDescriptor>
    )
  }

  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />
  }

  const tags = currency.tags
  if (!tags || tags.length === 0) return <span />

  return <TagDescriptor tags={tags} />
}

export function Balance({ balance }: { balance: CurrencyAmount }) {
  return <StyledBalanceText title={balance.toExact()}>{balance.toSignificant(LONG_PRECISION)}</StyledBalanceText>
}

export default function CurrencyList(
  ...paramsList: Parameters<typeof CurrencyListMod>
): ReturnType<typeof CurrencyListMod> {
  const [params] = paramsList
  return <CurrencyListMod {...params} BalanceComponent={Balance} TokenTagsComponent={TokenTags} />
}
