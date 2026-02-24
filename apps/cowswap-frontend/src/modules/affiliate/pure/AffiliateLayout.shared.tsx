import type { ReactNode } from 'react'

import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { ExtLink } from 'common/pure/AccountCard'

import { AFFILIATE_HOW_IT_WORKS_URL, AFFILIATE_TERMS_URL } from '../config/affiliateProgram.const'

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

export const Label = styled.label`
  font-size: 14px;
  color: var(${UI.COLOR_TEXT});
`

export const LabelActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`

export const HelperText = styled.span`
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  line-height: 1.5;
  text-align: center;
  max-width: 360px;
`

export const InlineError = styled.span`
  font-size: 12px;
  color: var(${UI.COLOR_DANGER_TEXT});
`

export const Separator = styled.span`
  opacity: 0.6;
`

const LinksRow = styled.div<{ $align: 'inline' | 'center' }>`
  display: ${({ $align }) => ($align === 'center' ? 'flex' : 'inline-flex')};
  align-items: center;
  justify-content: ${({ $align }) => ($align === 'center' ? 'center' : 'flex-start')};
  gap: 8px;
  width: ${({ $align }) => ($align === 'center' ? '100%' : 'auto')};
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
`

export function AffiliateTermsFaqLinks({ align = 'inline' }: { align?: 'inline' | 'center' }): ReactNode {
  return (
    <LinksRow $align={align}>
      <ExtLink href={AFFILIATE_TERMS_URL} target="_blank">
        <Trans>Terms</Trans>
      </ExtLink>
      <Separator>•</Separator>
      <ExtLink href={AFFILIATE_HOW_IT_WORKS_URL} target="_blank">
        <Trans>How it works</Trans>
      </ExtLink>
    </LinksRow>
  )
}

export const InlineNote = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
`
