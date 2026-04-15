import React, { ReactNode, useState } from 'react'

import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'

import SVG from 'react-inlinesvg'

import { ClickableWrapper, StyledCollapsibleBanner, StyledToggleArrow, ToggleIconContainer } from './styled'

import { CollapsibleInlineBannerProps } from '../InlineBanner/shared/types'

export function CollapsibleInlineBanner({
  collapsedContent,
  expandedContent,
  defaultExpanded = false,
  isCollapsible = true,
  onToggle,
  ...bannerProps
}: CollapsibleInlineBannerProps): ReactNode {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const toggle = (): void => {
    if (!isCollapsible) return
    setIsExpanded((state) => {
      onToggle?.(!state)
      return !state
    })
  }

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggle()
    }
  }

  return (
    <StyledCollapsibleBanner {...bannerProps} $isExpanded={isCollapsible ? isExpanded : true}>
      {isCollapsible ? (
        <ClickableWrapper>
          {isExpanded ? expandedContent : collapsedContent}
          <ToggleIconContainer
            onClick={toggle}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <StyledToggleArrow isOpen={isExpanded}>
              <SVG src={CarretIcon} />
            </StyledToggleArrow>
          </ToggleIconContainer>
        </ClickableWrapper>
      ) : (
        expandedContent
      )}
    </StyledCollapsibleBanner>
  )
}

export * from '../InlineBanner/shared/types'
