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

  const handleToggle = (): void => {
    if (!isCollapsible) return

    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    onToggle?.(newExpanded)
  }

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle()
    }
  }

  if (!isCollapsible) {
    return <StyledCollapsibleBanner {...bannerProps} $isExpanded={true}>{expandedContent}</StyledCollapsibleBanner>
  }

  return (
    <StyledCollapsibleBanner {...bannerProps} $isExpanded={isExpanded}>
      <ClickableWrapper>
        {isExpanded ? expandedContent : collapsedContent}
        <ToggleIconContainer
          onClick={handleToggle}
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
    </StyledCollapsibleBanner>
  )
}

export * from '../InlineBanner/shared/types'
