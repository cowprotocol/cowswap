import { useMemo, useState } from 'react'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useEmbedDialogState(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen)

  return useMemo(() => {
    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const handleOpen = () => setOpen(true)
    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const handleClose = () => setOpen(false)

    return {
      dialogOpen: open,
      handleDialogClose: handleClose,
      handleDialogOpen: handleOpen,
    }
  }, [open])
}
