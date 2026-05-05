import React from 'react';
import { Monitor, X } from 'lucide-react';
import './MobileWarning.css';

const MobileWarning = () => {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <div className="mobile-warning-v4">
      <div className="mobile-warning__content">
        <div className="mobile-warning__icon">
          <Monitor size={18} />
        </div>
        <div className="mobile-warning__text">
          <strong>Desktop Optimized</strong>
          <span>Switch to PC for the full retro experience.</span>
        </div>
        <button className="mobile-warning__close" onClick={() => setIsVisible(false)}>
          <X size={14} />
        </button>
      </div>
      <div className="mobile-warning__glow" />
    </div>
  );
};

export default MobileWarning;
