import styled from 'styled-components/macro'

import { AccountDetails } from './index'

const defaultProps = {
  pendingTransactions: [],
  confirmedTransactions: [],
  handleCloseOrdersPanel: () => void 0,
}

const Wrapper = styled.div`
  width: 800px;
  margin: 100px auto;
  padding: 20px;
`

// const chainId = 5

function Host() {
  return (
    <Wrapper>
      <AccountDetails {...defaultProps} />
    </Wrapper>
  )
}

const Fixtures = {
  default: <Host />,
}

export default Fixtures
