import { ConfirmSwapModalSetup, ConfirmSwapModalSetupProps } from '@cow/modules/swap/containers/ConfirmSwapModalSetup'
import { EthFlowModal, EthFlowProps } from '@cow/modules/swap/containers/EthFlow'
import React from 'react'
import { ImportTokenModal } from '@cow/modules/trade/containers/ImportTokenModal'
import { TradeApproveWidget } from '@cow/common/containers/TradeApprove/TradeApproveWidget'
import { useOnImportDismiss } from '@cow/modules/trade/hooks/useOnImportDismiss'
import { genericPropsChecker } from '@cow/utils/genericPropsChecker'

export interface NewSwapModalsProps {
  chainId: number | undefined
  showNativeWrapModal: boolean
  showCowSubsidyModal: boolean
  confirmSwapProps: ConfirmSwapModalSetupProps
  ethFlowProps: EthFlowProps
}

export const NewSwapModals = React.memo(function (props: NewSwapModalsProps) {
  const { chainId, showNativeWrapModal, /*showCowSubsidyModal*/, confirmSwapProps, ethFlowProps } = props

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
