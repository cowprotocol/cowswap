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

enum Tags {
  UNSUPPORTED = '0',
  GAS_FREE = '1',
  CIRCLE = '2',
}

const TOKEN_TAGS: Record<Tags, TagInfo> = {
  [Tags.UNSUPPORTED]: {
    name: 'Unsupported',
    description:
      'This token is unsupported as it does not operate optimally with CoW Protocol. Please refer to the FAQ for more information.',
    id: '0',
    color: StatusColorVariant.Warning,
  },
  [Tags.GAS_FREE]: {
    name: 'Gas-free',
    icon: ICON_GAS_FREE,
    description: 'This token supports gas-free approvals. Enjoy! 🐮',
    id: '1',
    color: StatusColorVariant.Success,
  },
  [Tags.CIRCLE]: {
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
  const tagsToShow: TagInfo[] = []

  // Handle Circle Native tag
  if (tags.includes('circle')) {
    tagsToShow.push(TOKEN_TAGS[Tags.CIRCLE])
  }

  if (isUnsupported) {
    tagsToShow.push(TOKEN_TAGS[Tags.UNSUPPORTED])
  } else if (isPermitCompatible) {
    tagsToShow.push(TOKEN_TAGS[Tags.GAS_FREE])
  }

  if (tagsToShow.length === 0) {
    return null
  }

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
