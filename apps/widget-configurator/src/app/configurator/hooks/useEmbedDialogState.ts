import { useState } from 'react'

export function useEmbedDialogState(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return {
    dialogOpen: open,
    handleDialogClose: handleClose,
    handleDialogOpen: handleOpen,
  }
}
