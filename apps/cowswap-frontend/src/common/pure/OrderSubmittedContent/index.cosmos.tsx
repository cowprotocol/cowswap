import { useState } from 'react'

import styled from 'styled-components/macro'

import { OrderSubmittedContent } from './index'

const defaultProps = {
  chainId: 1,
  account: '0x0001',
  isSafeWallet: false,
  hash: '0x62baf4be8adec4766d26a2169999cc170c3ead90ae11a28d658e6d75edc05b185b0abe214ab7875562adee331deff0fe1912fe42644d2bb7',
  onDismiss() {
    console.log('onDismiss')
  },
}

const Wrapper = styled.div`
  width: 560px;
  margin: 0 auto;
`

const Fixtures = {
  default: () => (
    <Wrapper>
      <OrderSubmittedContent {...defaultProps} />
    </Wrapper>
  ),
  withTrackOrderBanner: () => (
    <Wrapper>
      <OrderSubmittedContent
        {...defaultProps}
        showGetNotifiedMessage
        onGetNotifiedClick={() => console.log('onGetNotifiedClick')}
        onDismissGetNotifiedMessage={() => console.log('onDismissGetNotifiedMessage')}
      />
    </Wrapper>
  ),
  withTrackOrderBannerDismissible: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [dismissed, setDismissed] = useState(false)

    return (
      <Wrapper>
        <OrderSubmittedContent
          {...defaultProps}
          showGetNotifiedMessage={!dismissed}
          onGetNotifiedClick={() => console.log('onGetNotifiedClick')}
          onDismissGetNotifiedMessage={() => setDismissed(true)}
        />
      </Wrapper>
    )
  },
}

export default Fixtures
