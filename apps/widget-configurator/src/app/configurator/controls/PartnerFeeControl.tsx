import { ChangeEvent, Dispatch, SetStateAction, useCallback } from 'react'

import TextField from '@mui/material/TextField'

export interface PartnerFeeControlProps {
  feeBpsState: [number, Dispatch<SetStateAction<number>>]
  recipientState: [string, Dispatch<SetStateAction<string>>]
}
export function PartnerFeeControl(props: PartnerFeeControlProps) {
  const { feeBpsState, recipientState } = props
  const [feeBps, setFeeBps] = feeBpsState
  const [recipient, setRecipient] = recipientState

  const onFeeBpsChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = Math.ceil(Number(e.target.value || 0))

      setFeeBps(value)
    },
    [setFeeBps]
  )

  return (
    <>
      <TextField
        id="partnerFeePercent"
        label="Partner fee BPS"
        value={feeBps}
        onChange={onFeeBpsChange}
        type="number"
        size="small"
      />
      <TextField
        id="partnerFeeRecipient"
        label="Partner fee recipient"
        value={recipient}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setRecipient(e.target.value || '')}
        type="text"
        size="small"
      />
    </>
  )
}
