import { useState, useEffect } from 'react';

// LocalStorage key names
export enum LSKeys {
  BANNER_CUSTOM_RECIPIENT_DISMISSED = 'warningBannerCustomRecipientDismissed',
}

export const useBannerVisibility = (bannerKey: LSKeys): [boolean, () => void] => {
  // Initial value is based on localStorage
  const initialVisibility = !localStorage.getItem(bannerKey);
  const [isVisible, setIsVisible] = useState<boolean>(initialVisibility);

  useEffect(() => {
    if (!isVisible) {
      localStorage.setItem(bannerKey, 'true');
    }
  }, [isVisible, bannerKey]);

  const toggleVisibility = () => {
    setIsVisible(prev => !prev);
  };

  return [isVisible, toggleVisibility];
};
