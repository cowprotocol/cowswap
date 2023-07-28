import React from 'react'

import CancelReplaceTxUpdater from './CancelReplaceTxUpdater'
import FinalizeTxUpdater from './FinalizeTxUpdater'

export default function EnhancedTransactionsUpdater() {
  return (
    <>
      <FinalizeTxUpdater />
      <CancelReplaceTxUpdater />
    </>
  )
}
