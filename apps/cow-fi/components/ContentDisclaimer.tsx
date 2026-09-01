'use client'

import type { ReactNode } from 'react'

import { Font, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { CONFIG } from '@/const/meta'

const Disclaimer = styled.aside`
  width: 100%;
  max-width: 1760px;
  margin: 9.6rem auto 4rem;
  padding: 0;
  background: transparent;
  color: var(${UI.COLOR_NEUTRAL_40});
  font-size: 1.3rem;
  font-weight: ${Font.weight.regular};
  line-height: 1.5;

  strong {
    color: var(${UI.COLOR_NEUTRAL_0});
    font-weight: ${Font.weight.bold};
    line-height: inherit;
  }

  ${Media.upToLarge()} {
    padding: 0 2.4rem;
  }

  ${Media.upToMedium()} {
    margin: 8.8rem auto 2.4rem;
  }
`

export function ContentDisclaimer(): ReactNode {
  const { title, body } = CONFIG.contentDisclaimer

  return (
    <Disclaimer role="note" aria-label="Content disclaimer">
      <strong>{title}</strong> {body}
    </Disclaimer>
  )
}
