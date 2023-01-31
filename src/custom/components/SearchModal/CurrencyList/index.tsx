import styled from 'styled-components/macro'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { LONG_PRECISION, UNSUPPORTED_TOKENS_FAQ_URL } from 'constants/index'
import CurrencyListMod, { StyledBalanceText, Tag as TagMod, TagContainer } from './CurrencyListMod'
import { StyledLogo } from 'components/CurrencyLogo'
import { MouseoverTooltip } from 'components/Tooltip'
import { RowFixed } from 'components/Row'
import { LightGreyCard } from 'components/Card'
import { HashLink } from 'react-router-hash-link'
// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import { TagInfo } from 'state/lists/wrappedTokenInfo'
import { formatSmart } from '@cow/utils/format'
import Column from 'components/Column'
import { MenuItem as MenuItemMod } from '@src/components/SearchModal/styleds'
import { transparentize } from 'polished'

const UNSUPPORTED_TOKEN_TAG = [
  {
    name: t`Unsupported`,
    description: t`This token is unsupported as it does not operate optimally with CoW Protocol. Please refer to the FAQ for more information.`,
    id: '0',
  },
]

const Tag = styled(TagMod)<{ tag?: TagInfo }>`
  // Todo: Prevent usage of !important
  background: ${({ tag, theme }) => (tag?.id === '0' ? transparentize(0.85, theme.danger) : theme.grey1)};
  color: ${({ tag, theme }) => (tag?.id === '0' ? theme.danger : theme.text1)}!important;
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
  ${Column} {
    > div {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 220px;
      width: 100%;

      // Token symbol name
      &:first-of-type {
        color: ${({ theme }) => theme.text1};
      }

      // Token full name
      &:last-of-type {
        color: ${({ theme }) => theme.text2};
        font-weight: 400;
      }

      ${({ theme }) => theme.mediaWidth.upToSmall`
        max-width: 140px;
      `};
    }
  }

  ${StyledLogo} {
    height: 36px;
    width: 36px;
    border-radius: 36px;
  }

  ${TagMod} {
    color: ${({ theme }) => theme.text2};
  }

  ${TagLink} {
    color: ${({ theme }) => theme.text1};
  }

  ${LightGreyCard} {
    background: ${({ theme }) => theme.bg1};
  }

  ${LightGreyCard} ${RowFixed} > div {
    color: ${({ theme }) => theme.text1};
  }
`

export const MenuItem = styled(MenuItemMod)`
  &:hover {
    background-color: ${({ theme, disabled }) => !disabled && theme.grey1};
  }
`

function TagDescriptor({ tags, bg, children }: { children?: React.ReactNode; tags: TagInfo[]; bg?: string }) {
  const tag = tags[0]
  return (
    <TagContainer>
      <MouseoverTooltip text={tag.description}>
        <Tag tag={tag} key={tag.id}>
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

function TokenTags({ /* currency, */ isUnsupported }: { /* currency: Currency; */ isUnsupported: boolean }) {
  if (isUnsupported) {
    return (
      <TagDescriptor tags={UNSUPPORTED_TOKEN_TAG}>
        <TagLink>
          <HashLink to={UNSUPPORTED_TOKENS_FAQ_URL} target="_blank" onClick={(e) => e.stopPropagation()}>
            FAQ
          </HashLink>
        </TagLink>
      </TagDescriptor>
    )
  }

  return <span /> // MOD: return only UnsupportedToken tags

  /* if (!(currency instanceof WrappedTokenInfo)) {
    return <span />
  }

  const tags = currency.tags
  if (!tags || tags.length === 0) return <span />

  return <TagDescriptor tags={tags} /> */
}

export function Balance({ balance }: { balance: CurrencyAmount<Currency> }) {
  return <StyledBalanceText title={balance.toExact()}>{formatSmart(balance, LONG_PRECISION) || '0'}</StyledBalanceText>
}

export default function CurrencyList(
  ...paramsList: Parameters<typeof CurrencyListMod>
): ReturnType<typeof CurrencyListMod> {
  const [params] = paramsList
  return (
    <Wrapper id="currency-list">
      <CurrencyListMod {...params} BalanceComponent={Balance} TokenTagsComponent={TokenTags} />
    </Wrapper>
  )
}
