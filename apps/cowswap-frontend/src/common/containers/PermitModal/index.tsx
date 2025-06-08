import { useMemo } from 'react'

import { Identicon, useWalletInfo } from '@cowprotocol/wallet'

import { PermitModal as Pure, PermitModalProps } from '../../pure/PermitModal'

export type PermitModalContainerProps = Omit<PermitModalProps, 'icon'>

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function PermitModal(props: PermitModalContainerProps) {
  const { account } = useWalletInfo()

  const icon = useMemo(() => (account ? <Identicon account={account} size={80} /> : undefined), [account])

  return <Pure {...props} icon={icon} />
}
