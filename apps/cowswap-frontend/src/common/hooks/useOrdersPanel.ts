import { useState, useCallback } from 'react';

interface UseOrdersPanel {
  isOrdersPanelOpen: boolean;
  handleOpenOrdersPanel: () => void;
  handleCloseOrdersPanel: () => void;
}

export const useOrdersPanel = (): UseOrdersPanel => {
  const [isOrdersPanelOpen, setIsOrdersPanelOpen] = useState<boolean>(false);

  const handleOpenOrdersPanel = useCallback(() => {
    setIsOrdersPanelOpen(true);
  }, []);

  const handleCloseOrdersPanel = useCallback(() => {
    setIsOrdersPanelOpen(false);
  }, []);

  return {
    isOrdersPanelOpen,
    handleOpenOrdersPanel,
    handleCloseOrdersPanel,
  };
};
