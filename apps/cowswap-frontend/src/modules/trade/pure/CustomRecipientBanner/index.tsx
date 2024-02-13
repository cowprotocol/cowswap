import React from 'react'

import { isAddress, shortenAddress } from '@cowprotocol/common-utils'

import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { ExplorerLink } from 'legacy/components/ExplorerLink'

const Wrapper = styled.div`
  text-align: center;
  font-size: 16px;
  margin: 8px 0;
`

export function CustomRecipientBanner({ recipient }: { recipient: Nullish<string> }) {
  if (!recipient) return null

  return (
    <Wrapper>
      Output will be sent to{' '}
      <b title={recipient}>
        <ExplorerLink
          type="address"
          id={recipient}
          label={isAddress(recipient) ? shortenAddress(recipient) : recipient}
        />
      </b>
    </Wrapper>
  )
}
