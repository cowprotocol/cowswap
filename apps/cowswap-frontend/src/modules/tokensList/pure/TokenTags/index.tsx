import { UNSUPPORTED_TOKENS_FAQ_URL } from '@cowprotocol/common-const'
import { HoverTooltip } from '@cowprotocol/ui'
import { StatusColorVariant, getStatusColorEnums } from '@cowprotocol/ui'

import ICON_GAS_FREE from 'assets/icon/gas-free.svg'
import SVG from 'react-inlinesvg'
import { NavLink } from 'react-router-dom'

import * as styledEl from './styled'

interface TagInfo {
  id: string
  name: string
  description: string
  icon?: string
  color?: StatusColorVariant
}

export type TokenTagType = keyof typeof TOKEN_TAGS

const TOKEN_TAGS: Record<string, TagInfo> = {
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
  circle: {
    name: 'Circle Native',
    description: 'Token officially issued by Circle',
    id: '2',
    color: StatusColorVariant.Info,
  },
}

export function TokenTags({
  isUnsupported,
  isPermitCompatible,
  tags = [],
}: {
  isUnsupported: boolean
  isPermitCompatible?: boolean
  tags?: string[]
}) {
  const tagsToShow = isUnsupported
    ? [TOKEN_TAGS.unsupported]
    : [
        // Include valid tags from token.tags
        ...tags.filter((tag) => tag in TOKEN_TAGS).map((tag) => TOKEN_TAGS[tag as TokenTagType]),
        // Add gas-free tag if applicable
        ...(isPermitCompatible ? [TOKEN_TAGS['gas-free']] : []),
      ]

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
