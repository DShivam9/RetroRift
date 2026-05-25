import React from 'react';
import { Monitor, X } from 'lucide-react';
import './MobileWarning.css';

const MobileWarning = () => {
  const [isVisible, setIsVisible] = React.useState(() => {
    return localStorage.getItem('mobileWarningDismissed') !== 'true';
  });

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('mobileWarningDismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="mobile-warning-v4">
      <div className="mobile-warning__content">
        <div className="mobile-warning__icon">
          <Monitor size={18} />
        </div>
        <div className="mobile-warning__text">
          <strong>Desktop Recommended</strong>
          <span>You can play on mobile, but switching to a desktop browser gives the best experience.</span>
        </div>
        <button className="mobile-warning__close" onClick={handleDismiss} aria-label="Dismiss">
          <X size={14} />
        </button>
      </div>
      <div className="mobile-warning__progress" />
      <div className="mobile-warning__glow" />
    </div>
  );
};

export default MobileWarning;
