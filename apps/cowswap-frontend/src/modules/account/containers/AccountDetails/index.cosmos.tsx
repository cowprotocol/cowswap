import { useSelect } from 'react-cosmos/client'
import styled from 'styled-components/macro'

import { AccountDetails } from './index'

const defaultProps = {
  pendingTransactions: [],
  confirmedTransactions: [],
  toggleWalletModal: () => void 0,
  toggleAccountSelectorModal: () => void 0,
  handleCloseOrdersPanel: () => void 0,
}

const Wrapper = styled.div`
  width: 800px;
  margin: 100px auto;
  padding: 20px;
`

// const chainId = 5

function Host() {
  const [isHardWare] = useSelect('Is hardware wallet', {
    options: ['true', 'false'],
    defaultValue: 'false',
  })

  return (
    <Wrapper>
      <AccountDetails {...defaultProps} forceHardwareWallet={isHardWare === 'true'} />
    </Wrapper>
  )
}

const Fixtures = {
  default: <Host />,
}

export default Fixtures
