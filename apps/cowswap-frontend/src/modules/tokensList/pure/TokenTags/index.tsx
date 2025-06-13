import { useMemo } from 'react'

import { UNSUPPORTED_TOKENS_FAQ_URL } from '@cowprotocol/common-const'
import { TagInfo, TokenListTags } from '@cowprotocol/tokens'
import { getStatusColorEnums, HoverTooltip, StatusColorVariant } from '@cowprotocol/ui'

import ICON_GAS_FREE from 'assets/icon/gas-free.svg'
import SVG from 'react-inlinesvg'
import { NavLink } from 'react-router'

import * as styledEl from './styled'

// Programmatic tags that don't come from tokenlists
const APP_TOKEN_TAGS: TokenListTags = {
  unsupported: {
    name: 'Unsupported',
    description:
      'This token is unsupported as it does not operate optimally with CoW Protocol. Please refer to the FAQ for more information.',
    id: '0',
    color: StatusColorVariant.Warning,
  },
  'gas-free': {
    name: 'Gas-free',
    icon: ICON_GAS_FREE,
    description: 'This token supports gas-free approvals. Enjoy! 🐮',
    id: '1',
    color: StatusColorVariant.Success,
  },
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TokenTags({
  isUnsupported,
  isPermitCompatible,
  tags = [],
  tokenListTags,
}: {
  isUnsupported: boolean
  isPermitCompatible?: boolean
  tags?: string[]
  tokenListTags: TokenListTags
}) {
  const tagsToShow = useMemo(() => {
    return isUnsupported
      ? [APP_TOKEN_TAGS.unsupported]
      : [
        // Include valid tags from token.tags
        ...tags.filter((tag) => tag in tokenListTags).map((tag) => tokenListTags[tag]),
        // Add gas-free tag if applicable
        ...(isPermitCompatible ? [APP_TOKEN_TAGS['gas-free']] : []),
      ]
  }, [isUnsupported, tags, tokenListTags, isPermitCompatible])

  if (tagsToShow.length === 0) return null

  return (
    <TagDescriptor tags={tagsToShow}>
      {isUnsupported && (
        <styledEl.TagLink colorEnums={getStatusColorEnums(StatusColorVariant.Default)}>
          <NavLink to={UNSUPPORTED_TOKENS_FAQ_URL} target="_blank">
            FAQ
          </NavLink>
        </styledEl.TagLink>
      )}
    </TagDescriptor>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function TagDescriptor({ tags, children }: { children?: React.ReactNode; tags: TagInfo[] }) {
  return (
    <styledEl.TagContainer>
      {tags.map((tag) => {
        const colorEnums = getStatusColorEnums(tag.color || StatusColorVariant.Default)
        return (
          <HoverTooltip wrapInContainer key={tag.id} content={tag.description}>
            <styledEl.Tag tag={tag} colorEnums={colorEnums}>
              {tag.icon ? <SVG src={tag.icon} title={tag.name} /> : null}
              {tag.name}
            </styledEl.Tag>
          </HoverTooltip>
        )
      })}
      {children}
    </styledEl.TagContainer>
  )
}
