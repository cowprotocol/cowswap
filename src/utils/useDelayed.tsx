import React, { useState, useEffect } from 'react';

type Props = {
  children: React.ReactNode
  waitBeforeShow?: number;
};

export const Delayed = ({ children, waitBeforeShow = 1500 }: Props) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(true);
    }, waitBeforeShow);
    return () => clearTimeout(timer);
  }, [waitBeforeShow]);

  console.log('isShown', isShown)

  return isShown ? <>{children}</> : null;
};

export default Delayed;