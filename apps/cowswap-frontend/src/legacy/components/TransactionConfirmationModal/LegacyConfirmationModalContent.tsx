import React, { ReactNode } from 'react'

import { Text } from 'rebass'

import { BottomSection, CloseIconWrapper, ContentWrapper, GPModalHeader, Section } from './styled'

export interface ConfirmationModalContentProps {
  title: ReactNode
  titleSize?: number
  styles?: React.CSSProperties
  className?: string
  onDismiss: () => void
  topContent: () => ReactNode
  bottomContent?: () => ReactNode | undefined
}

export function LegacyConfirmationModalContent({
  title,
  titleSize,
  styles,
  className,
  bottomContent,
  onDismiss,
  topContent,
}: ConfirmationModalContentProps) {
  return (
    <ContentWrapper className={className}>
      <Section>
        <GPModalHeader>
          <Text fontWeight={600} fontSize={titleSize || 16} style={styles}>
            {title}
          </Text>
          <CloseIconWrapper onClick={() => onDismiss()} />
        </GPModalHeader>
        {topContent()}
      </Section>
      {bottomContent && <BottomSection gap="12px">{bottomContent()}</BottomSection>}
    </ContentWrapper>
  )
}
