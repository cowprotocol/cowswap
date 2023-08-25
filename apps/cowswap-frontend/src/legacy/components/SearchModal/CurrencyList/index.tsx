import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

// eslint-disable-next-line no-restricted-imports
// import { t } from '@lingui/macro'
import ICON_GAS_FREE from 'assets/icon/gas-free.svg'
import { HashLink } from 'react-router-hash-link'
import styled from 'styled-components/macro'

import { LightGreyCard } from 'legacy/components/Card'
import Column from 'legacy/components/Column'
import { RowFixed } from 'legacy/components/Row'
import { MenuItem as MenuItemMod } from 'legacy/components/SearchModal/styleds'
import { MouseoverTooltip } from 'legacy/components/Tooltip'
import { UNSUPPORTED_TOKENS_FAQ_URL } from 'legacy/constants'
import { TagInfo } from 'legacy/state/lists/wrappedTokenInfo'

import { StyledLogo } from 'common/pure/CurrencyLogo'
import { TokenAmount } from 'common/pure/TokenAmount'

import CurrencyListMod, { StyledBalanceText, TagContainer } from './CurrencyListMod'
import { Tag as TagMod } from './styled'


const TOKEN_TAGS: TagInfo[] = [
  {
    name: 'Unsupported',
    description:
      'This token is unsupported as it does not operate optimally with CoW Protocol. Please refer to the FAQ for more information.',
    id: '0',
  },
  {
    name: 'Gas-free approval',
    icon: ICON_GAS_FREE,
    description: 'This token can be approved without spending gas, using the token Permit.',
    id: '1',
  }
]

const Tag = styled(TagMod)<{ tag?: TagInfo }>`
  display: flex;
  align-items: center;
  background: ${({ tag }) => (tag?.id === '0' ? 'var(--cow-color-danger-bg)' : tag?.id === '1' ? 'var(--cow-color-success-bg)' : 'var(--cow-color-grey)')};
  color: ${({ tag }) => (tag?.id === '0' ? 'var(--cow-color-danger-text)' : tag?.id === '1' ? 'var(--cow-color-success-text)' : 'var(--cow-color-text1)')};
  font-size: 12px;
  font-weight: var(--cow-font-weight-medium);
  border-radius: 4px;
  padding: 4px 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin: 0 4px 0 0;

  > img {
    --size: 14px;
    display: inline-block;
    margin: 0 5px 0 0;
    width: var(--size);
    height: var(--size);
  }
`

const TagLink = styled(Tag)`
  a {
    color: inherit;
    font-weight: inherit;
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

function TokenTags({
  isUnsupported, 
  isPermitCompatible
}: { 
  isUnsupported: boolean; 
  isPermitCompatible?: boolean; 
}) {

  const tagsToShow: TagInfo[] = [];

  // If the token is unsupported, add the related tag to the tagsToShow array.
  if (isUnsupported) {
    tagsToShow.push(TOKEN_TAGS[0]);
  } 
  // If the token has gas-free approval (permit compatible), add the related tag.
  else if (isPermitCompatible) {
    tagsToShow.push(TOKEN_TAGS[1]);
  }

  if (tagsToShow.length === 0) {
    return <span />;
  }

  return (
    <TagDescriptor tags={tagsToShow}>
      {isUnsupported && (
        <TagLink>
          <HashLink to={UNSUPPORTED_TOKENS_FAQ_URL} target="_blank" onClick={(e) => e.stopPropagation()}>
            FAQ
          </HashLink>
        </TagLink>
      )}
    </TagDescriptor>
  );
}

function TagDescriptor({ tags, children }: { children?: React.ReactNode; tags: TagInfo[]; }) {
  return (
    <TagContainer>
      {tags.map(tag => (
        <MouseoverTooltip key={tag.id} text={tag.description}>
          <Tag tag={tag}>
            {tag.icon ? <img src={tag.icon} alt={tag.name} /> : null}
            {tag.name}
          </Tag>
        </MouseoverTooltip>
      ))}
      {children}
    </TagContainer>
  );
}

export function Balance({ balance }: { balance: CurrencyAmount<Currency> }) {
  return (
    <StyledBalanceText>
      <TokenAmount amount={balance} />
    </StyledBalanceText>
  )
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
