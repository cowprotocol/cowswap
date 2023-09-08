import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

// eslint-disable-next-line no-restricted-imports
// import { t } from '@lingui/macro'
import ICON_GAS_FREE from 'assets/icon/gas-free.svg'
import { HashLink } from 'react-router-hash-link'
import styled from 'styled-components/macro'


import { MenuItem as MenuItemMod } from 'legacy/components/SearchModal/styleds'
import { MouseoverTooltip } from 'legacy/components/Tooltip'
import { UNSUPPORTED_TOKENS_FAQ_URL } from 'legacy/constants'
import { TagInfo } from 'legacy/state/lists/wrappedTokenInfo'

import { TokenAmount } from 'common/pure/TokenAmount'

import CurrencyListMod, { StyledBalanceText, TagContainer } from './CurrencyListMod'
import { Wrapper, Tag, TagLink } from './styled'

enum Tags {
  UNSUPPORTED = '0',
  GAS_FREE = '1',
}

const TOKEN_TAGS: Record<Tags, TagInfo> = {
  [Tags.UNSUPPORTED]: {
    name: 'Unsupported',
    description:
      'This token is unsupported as it does not operate optimally with CoW Protocol. Please refer to the FAQ for more information.',
    id: '0',
  },
  [Tags.GAS_FREE]: {
    name: 'Gas-free approval',
    icon: ICON_GAS_FREE,
    description: 'This token can be approved without spending gas, using the token Permit.',
    id: '1',
  }
};

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

  if (isUnsupported) {
    tagsToShow.push(TOKEN_TAGS[Tags.UNSUPPORTED]);
  } else if (isPermitCompatible) {
    tagsToShow.push(TOKEN_TAGS[Tags.GAS_FREE]);
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
