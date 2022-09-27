import { ApproveButton, ApproveButtonProps } from '.'

import { COW, GNO } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { useSelect, useValue } from 'react-cosmos/fixture'

const COW_TOKEN = COW[SupportedChainId.MAINNET]
const GNO_TOKEN = GNO[SupportedChainId.MAINNET]

function useCustomProps(props: Partial<ApproveButtonProps> = {}): ApproveButtonProps {
  const [currencyRaw] = useSelect('currency', {
    options: [COW_TOKEN.symbol || '', GNO_TOKEN.symbol || ''],
    defaultValue: COW_TOKEN.symbol || '',
  })
  const currency = currencyRaw === COW_TOKEN.symbol ? COW_TOKEN : GNO_TOKEN

  const [disabled] = useValue('disabled', { defaultValue: props.disabled ?? false })
  const [isConfirmed] = useValue('isConfirmed', { defaultValue: props.isConfirmed ?? false })
  const [isPending] = useValue('isPending', { defaultValue: props.isPending ?? false })
  const [recentlyApproved] = useValue('recentlyApproved', { defaultValue: props.recentlyApproved ?? false })

  return {
    currency,
    disabled,
    isConfirmed,
    isPending,
    recentlyApproved,
    onClick() {
      console.log('Click!')
    },
  }
}

const Custom = () => {
  return <ApproveButton {...useCustomProps()} />
}

export default <Custom />
