import React, { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { CloseIconButton } from '@cowprotocol/ui'

import { Text } from 'rebass'

import { BottomSection, ContentWrapper, GPModalHeader, Section } from './styled'

export interface ConfirmationModalContentProps {
  title: ReactNode
  titleSize?: number
  styles?: React.CSSProperties
  className?: string
  onDismiss: Command
  topContent: ReactNode
  bottomContent?: ReactNode
}

// @deprecated use common/pure/NewModal instead
export function LegacyConfirmationModalContent({
  title,
  titleSize,
  styles,
  className,
  bottomContent,
  onDismiss,
  topContent,
}: ConfirmationModalContentProps): ReactNode {
  return (
    <ContentWrapper className={className}>
      <Section>
        <GPModalHeader>
          <Text fontWeight={600} fontSize={titleSize || 16} style={styles}>
            {title}
          </Text>
          <CloseIconButton closeOnEscape={false} onClick={onDismiss} />
        </GPModalHeader>
        {topContent}
      </Section>
      {bottomContent && <BottomSection gap="12px">{bottomContent}</BottomSection>}
    </ContentWrapper>
  )
}
