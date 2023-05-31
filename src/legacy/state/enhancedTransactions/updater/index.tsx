import React from 'react'

import CancelReplaceTxUpdater from './CancelReplaceTxUpdater'
import FinalizeTxUpdater from './FinalizeTxUpdater'

export default function Updater() {
  return (
    <>
      <FinalizeTxUpdater />
      <CancelReplaceTxUpdater />
    </>
  )
}
