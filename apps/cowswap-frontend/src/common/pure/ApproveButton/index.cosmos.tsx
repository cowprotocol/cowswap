import { COW, GNO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { DemoContainer } from 'cosmos.decorator'
import { useSelect } from 'react-cosmos/client'

import { ApprovalState } from '../../hooks/useApproveState'

import { ApproveButton } from '.'

const COW_TOKEN = COW[SupportedChainId.MAINNET]
const GNO_TOKEN = GNO[SupportedChainId.MAINNET]

const Custom = () => {
  const [currencyRaw] = useSelect('currency', {
    options: [COW_TOKEN.symbol || '', GNO_TOKEN.symbol || ''],
    defaultValue: COW_TOKEN.symbol || '',
  })
  const [state] = useSelect('state', {
    options: Object.values(ApprovalState),
    defaultValue: ApprovalState.NOT_APPROVED,
  })
  const currency = currencyRaw === COW_TOKEN.symbol ? COW_TOKEN : GNO_TOKEN

  return (
    <DemoContainer>
      <ApproveButton currency={currency} state={state} onClick={() => void 0} />
    </DemoContainer>
  )
}

const Fixtures = {
  default: <Custom />,
}

export default Fixtures
