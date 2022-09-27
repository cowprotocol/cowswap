import { ApproveButton, ApproveButtonProps } from '.'

import { COW, GNO } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { useSelect } from 'react-cosmos/fixture'

const COW_TOKEN = COW[SupportedChainId.MAINNET]
const GNO_TOKEN = GNO[SupportedChainId.MAINNET]

const defaultProps: ApproveButtonProps = {
  currency: COW_TOKEN,
  disabled: false,
  isConfirmed: false,
  isPending: false,
  isRecentlyApproved: false,
  onClick() {
    console.log('Click!')
  },
}

// function useCustomProps(props: Partial<ApproveButtonProps> = {}): ApproveButtonProps {
//   const [currencyRaw] = useSelect('currency', {
//     options: [COW_TOKEN.symbol || '', GNO_TOKEN.symbol || ''],
//     defaultValue: COW_TOKEN.symbol || '',
//   })
//   const currency = currencyRaw === COW_TOKEN.symbol ? COW_TOKEN : GNO_TOKEN

//   const [disabled] = useValue('disabled', { defaultValue: defaultProps.disabled ?? false })
//   const [isConfirmed] = useValue('isConfirmed', { defaultValue: defaultProps.isConfirmed ?? false })
//   const [isPending] = useValue('isPending', { defaultValue: defaultProps.isPending ?? false })
//   const [recentlyApproved] = useValue('recentlyApproved', { defaultValue: defaultProps.recentlyApproved ?? false })

//   return {
//     currency,
//     disabled,
//     isConfirmed,
//     isPending,
//     recentlyApproved,
//     onClick() {
//       console.log('Click!')
//     },
//   }
// }

const Custom = (props: Partial<ApproveButtonProps> = {}) => {
  const [currencyRaw] = useSelect('currency', {
    options: [COW_TOKEN.symbol || '', GNO_TOKEN.symbol || ''],
    defaultValue: COW_TOKEN.symbol || '',
  })
  const currency = currencyRaw === COW_TOKEN.symbol ? COW_TOKEN : GNO_TOKEN

  return <ApproveButton {...{ ...defaultProps, ...props, currency }} />
}

const Fixtures = {
  approve: <Custom />,
  disabled: <Custom disabled={true} />,
  isPending: <Custom isPending={true} />,
  isRecentlyApproved: <Custom isConfirmed={true} isRecentlyApproved={true} />,

  default: <Custom {...defaultProps} />,
}

export default Fixtures
