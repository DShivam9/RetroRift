import React, { useEffect, useState } from 'react';
import './CartridgeLoader.css';

export default function CartridgeLoader({ game, colorTheme, loadError, errorMessage, onClearCache }) {
  const [phase, setPhase] = useState('dropping'); // 'dropping', 'snapped', 'loading', 'error'
  
  useEffect(() => {
    if (loadError) {
      setPhase('error');
      return;
    }

    // Snap sound effect or visual lock after drop animation completes
    const snapTimer = setTimeout(() => {
      if (!loadError) setPhase('snapped');
    }, 800); 

    // Pulse loading text after it snaps
    const loadingTimer = setTimeout(() => {
      if (!loadError) setPhase('loading');
    }, 1200);

    return () => {
      clearTimeout(snapTimer);
      clearTimeout(loadingTimer);
    };
  }, [loadError]);

  const primaryColor = colorTheme?.primary || '#8b5cf6';
  const borderColor = colorTheme?.border || '#374151';
  const ledColor = colorTheme?.led || '#fbbf24';

  return (
    <div className="cartridge-loader-container cinematic-mode">
      {/* Background Volumetric Glow */}
      <div className="ambient-glow" style={{ '--glow-color': primaryColor }}></div>
      
      {/* Dust Particles */}
      <div className="dust-particles">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="dust" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>

      <div className="hardware-assembly">
        {/* The Back Lip of the console slot (Cartridge goes in front of this) */}
        <div className="slot-lip-back"></div>

        <div 
          className={`cinematic-cartridge ${phase}`} 
          style={{ 
            '--primary-color': primaryColor,
            '--border-color': borderColor,
            '--led-color': ledColor
          }}
        >
          <div className="cartridge-3d-body">
            <div className="cartridge-top-grooves">
              <div className="groove"></div>
              <div className="groove"></div>
              <div className="groove"></div>
            </div>
            
            <div className="cartridge-front-face">
              <div className="cartridge-led-indicator"></div>
              <div className="cartridge-sticker-area">
                {game?.thumbnail ? (
                  <img src={game.thumbnail} alt={game?.title} className="cartridge-cover-art" />
                ) : (
                  <div className="cartridge-placeholder-art">
                    <span style={{ fontSize: '10px', opacity: 0.5, marginBottom: '8px', display: 'block' }}>{game?.console}</span>
                    {game?.title || 'SYSTEM'}
                  </div>
                )}
                <div className="cartridge-seal-cinematic"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* The Front of the console slot (Cartridge goes behind this) */}
        <div className={`console-slot-3d ${phase !== 'dropping' ? 'slot-engaged' : ''}`}>
          <div className="slot-lip-front"></div>
          <div className="slot-glow" style={{ '--glow-color': primaryColor }}></div>
        </div>
      </div>
      
      {phase === 'loading' && !loadError && (
        <div className="loading-typography">
          <span className="loading-text">INITIALIZING</span>
          <div className="loading-bar-container">
            <div className="loading-bar-fill"></div>
          </div>
        </div>
      )}

      {phase === 'error' && (
        <div className="error-typography">
          <span className="error-title">SYSTEM HALT</span>
          <p className="error-subtitle">{errorMessage || 'Corrupted or missing ROM data.'}</p>
          <div className="loading-bar-container" style={{ background: '#7f1d1d', marginTop: '15px' }}>
            <div className="loading-bar-fill" style={{ width: '100%', background: '#ef4444', animation: 'none' }}></div>
          </div>
          <div className="error-actions">
            <button className="eject-button" onClick={() => window.location.reload()}>EJECT</button>
            {onClearCache && (
               <button className="eject-button" onClick={onClearCache}>CLEAR CACHE</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
