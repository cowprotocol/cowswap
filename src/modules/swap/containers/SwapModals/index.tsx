import { ConfirmSwapModalSetup, ConfirmSwapModalSetupProps } from 'modules/swap/containers/ConfirmSwapModalSetup'
import { EthFlowModal, EthFlowProps } from 'modules/swap/containers/EthFlow'
import React from 'react'
import { ImportTokenModal } from 'modules/trade/containers/ImportTokenModal'
import { TradeApproveWidget } from 'common/containers/TradeApprove/TradeApproveWidget'
import { useOnImportDismiss } from 'modules/trade/hooks/useOnImportDismiss'
import { genericPropsChecker } from 'utils/genericPropsChecker'

export interface SwapModalsProps {
  chainId: number | undefined
  showNativeWrapModal: boolean
  showCowSubsidyModal: boolean
  confirmSwapProps: ConfirmSwapModalSetupProps
  ethFlowProps: EthFlowProps
}

export const SwapModals = React.memo(function (props: SwapModalsProps) {
  const { chainId, showNativeWrapModal, confirmSwapProps, ethFlowProps } = props

  // const closeModals = useCloseModals()
  const onImportDismiss = useOnImportDismiss()

  console.debug('RENDER SWAP MODALS: ', props)

  return (
    <>
      {chainId && <ImportTokenModal chainId={chainId} onDismiss={onImportDismiss} />}
      {/* TODO: Re-enable modal once subsidy is back  */}
      {/*<CowSubsidyModal isOpen={showCowSubsidyModal} onDismiss={closeModals} /> */}
      {<ConfirmSwapModalSetup {...confirmSwapProps} />}
      {showNativeWrapModal && <EthFlowModal {...ethFlowProps} />}
      <TradeApproveWidget />
    </>
  )
}, genericPropsChecker)
