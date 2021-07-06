import React from 'react'
import styled from 'styled-components'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { LONG_PRECISION, UNSUPPORTED_TOKENS_FAQ_URL } from 'constants/index'
import CurrencyListMod, { StyledBalanceText, Tag as TagMod, TagContainer } from './CurrencyListMod'
import { StyledLogo } from 'components/CurrencyLogo'
import { MenuItem } from 'components/SearchModal/styleds'
import { MouseoverTooltip } from 'components/Tooltip'
import { RowFixed } from 'components/Row'
import { LightGreyCard } from 'components/Card'
import { HashLink } from 'react-router-hash-link'
import { t } from '@lingui/macro'
import { TagInfo, WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'

const UNSUPPORTED_TOKEN_TAG = [
  {
    name: t`Unsupported`,
    description: t`This token is unsupported as it does not operate optimally with Gnosis Protocol. Please refer to the FAQ for more information.`,
    id: '0',
  },
]

const Tag = styled(TagMod)<{ bg?: string }>`
  background: ${({ bg, theme }) => bg || theme.bg1};
  max-width: 6.1rem;
`

const TagLink = styled(Tag)`
  display: flex;
  align-items: center;
  font-size: x-small;
  a {
    color: inherit;
    font-weight: bold;
  }
`

const Wrapper = styled.div`
  ${MenuItem} {
    &:hover {
      background-color: ${({ theme }) => theme.bg4};
    }
  }

  ${StyledLogo} {
    background: ${({ theme }) => theme.bg1};
  }

  ${TagMod} {
    color: ${({ theme }) => theme.text2};
  }

  ${TagLink} {
    color: ${({ theme }) => theme.text1};
  }

  ${LightGreyCard} ${RowFixed} > div {
    color: ${({ theme }) => theme.text2};
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
            .map(({ name, description }) => t`${name}: ${description}`)
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
          <HashLink to={UNSUPPORTED_TOKENS_FAQ_URL} target="_blank" onClick={(e) => e.stopPropagation()}>
            FAQ
          </HashLink>
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

export function Balance({ balance }: { balance: CurrencyAmount<Currency> }) {
  return <StyledBalanceText title={balance.toExact()}>{balance.toSignificant(LONG_PRECISION)}</StyledBalanceText>
}

export default function CurrencyList(
  ...paramsList: Parameters<typeof CurrencyListMod>
): ReturnType<typeof CurrencyListMod> {
  const [params] = paramsList
  return (
    <Wrapper>
      <CurrencyListMod {...params} BalanceComponent={Balance} TokenTagsComponent={TokenTags} />
    </Wrapper>
  )
}
