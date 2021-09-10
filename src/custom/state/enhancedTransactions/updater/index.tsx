import React from 'react'

import FinalizeTxUpdater from './FinalizeTxUpdater'
import GnosisSafeTxUpdater from './GnosisSafeTxUpdater'
import CancelReplaceTxUpdater from './CancelReplaceTxUpdater'

export default function Updater() {
  return (
    <>
      <FinalizeTxUpdater />
      <GnosisSafeTxUpdater />
      <CancelReplaceTxUpdater />
    </>
  )
}
