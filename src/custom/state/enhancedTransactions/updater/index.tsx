import React from 'react'

import FinalizeTxUpdater from './FinalizeTxUpdater'
import CancelReplaceTxUpdater from './CancelReplaceTxUpdater'

export default function Updater() {
  return (
    <>
      <FinalizeTxUpdater />
      <CancelReplaceTxUpdater />
    </>
  )
}
