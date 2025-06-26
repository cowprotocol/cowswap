import { ReactNode } from 'react'

import Typography from '@mui/material/Typography'

import { SlippageConfigControl } from './SlippageConfigControl'

interface SlippageState {
  min?: number
  max?: number
  defaultValue?: number
}

export interface SlippageSettingsControlProps {
  ethFlowSlippage?: SlippageState
  erc20Slippage?: SlippageState
}

export function SlippageSettingsControl(props: SlippageSettingsControlProps): ReactNode {
  const {
    ethFlowSlippage,
    erc20Slippage,
  } = props

  const onEthFlowSlippageChange = (
    fieldName: keyof SlippageState,
    value?: number
  ) => {
    return null
  }

  return (
    <>
      <Typography variant="subtitle1">ETH flow slippage settings</Typography>
      <SlippageConfigControl {...ethFlowSlippage}
                             label={'Slippage label'}
                             minChainSlippage={0.5}
                             maxChainSlippage={100}
                             onSlippageChange={onEthFlowSlippageChange}/>
      <Typography variant="subtitle1">ERC20 slippage settings</Typography>
      <SlippageConfigControl {...erc20Slippage}
                             label={'Slippage label'}
                             minChainSlippage={0.5}
                             maxChainSlippage={100}
                             onSlippageChange={onEthFlowSlippageChange}/>
    </>
  )
}
