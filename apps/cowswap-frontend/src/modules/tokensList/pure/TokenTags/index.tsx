import { UNSUPPORTED_TOKENS_FAQ_URL } from '@cowprotocol/common-const'
import { HoverTooltip } from '@cowprotocol/ui'

import ICON_GAS_FREE from 'assets/icon/gas-free.svg'
import SVG from 'react-inlinesvg'
import { HashLink } from 'react-router-hash-link'

import * as styledEl from './styled'

interface TagInfo {
  id: string
  name: string
  description: string
  icon?: string
}

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
    description: 'This token supports gas-free approvals. Enjoy! 🐮',
    id: '1',
  },
}

export function TokenTags({
  isUnsupported,
  isPermitCompatible,
}: {
  isUnsupported: boolean
  isPermitCompatible?: boolean
}) {
  const tagsToShow: TagInfo[] = []

  if (isUnsupported) {
    tagsToShow.push(TOKEN_TAGS[Tags.UNSUPPORTED])
  } else if (isPermitCompatible) {
    tagsToShow.push(TOKEN_TAGS[Tags.GAS_FREE])
  }

  if (tagsToShow.length === 0) {
    return <span />
  }

  return (
    <TagDescriptor tags={tagsToShow}>
      {isUnsupported && (
        <styledEl.TagLink>
          <HashLink to={UNSUPPORTED_TOKENS_FAQ_URL} target="_blank" onClick={(e) => e.stopPropagation()}>
            FAQ
          </HashLink>
        </styledEl.TagLink>
      )}
    </TagDescriptor>
  )
}

function TagDescriptor({ tags, children }: { children?: React.ReactNode; tags: TagInfo[] }) {
  return (
    <styledEl.TagContainer>
      {tags.map((tag) => (
        <HoverTooltip wrapInContainer key={tag.id} content={tag.description}>
          <styledEl.Tag tag={tag}>
            {tag.icon ? <SVG src={tag.icon} title={tag.name} /> : null}
            {tag.name}
          </styledEl.Tag>
        </HoverTooltip>
      ))}
      {children}
    </styledEl.TagContainer>
  )
}
