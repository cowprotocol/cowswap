import { ApproveButton } from '.'

import { COW, GNO } from 'legacy/constants/tokens'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useSelect } from 'react-cosmos/fixture'
import { ApprovalState } from 'legacy/hooks/useApproveCallback'

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

  return <ApproveButton currency={currency} state={state} onClick={() => void 0} />
}

const Fixtures = {
  default: <Custom />,
}

export default Fixtures
