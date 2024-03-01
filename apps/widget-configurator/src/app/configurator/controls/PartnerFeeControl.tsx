import { ChangeEvent, Dispatch, SetStateAction } from 'react'

import TextField from '@mui/material/TextField'

export interface PartnerFeeControlProps {
  feePercentState: [number, Dispatch<SetStateAction<number>>]
  recipientState: [string, Dispatch<SetStateAction<string>>]
}
export function PartnerFeeControl(props: PartnerFeeControlProps) {
  const { feePercentState, recipientState } = props
  const [percent, setPercent] = feePercentState
  const [recipient, setRecipient] = recipientState

  return (
    <>
      <TextField
        id="partnerFeePercent"
        label="Partner fee percent"
        value={percent}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setPercent(Number(e.target.value || 0))}
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
