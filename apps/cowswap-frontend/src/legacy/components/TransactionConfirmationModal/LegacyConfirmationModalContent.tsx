import React, { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'

import { Text } from 'rebass'

import { BottomSection, CloseIconWrapper, ContentWrapper, GPModalHeader, Section } from './styled'

export interface ConfirmationModalContentProps {
  title: ReactNode
  titleSize?: number
  styles?: React.CSSProperties
  className?: string
  onDismiss: Command
  topContent: () => ReactNode
  bottomContent?: () => ReactNode | undefined
}

// @deprecated use common/pure/NewModal instead
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
