import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagneticParticleField,
  CircuitBoardTrace,
  SmokeFogDrift,
  StarfieldWarp,
  DNAHelixLattice,
  Dither,
  CyberTunnel,
  CometShower,
  PixelNebula
} from '../index';

/**
 * EnvironmentEngine
 * Manages the background rendering based on the selected theme.
 */
const EnvironmentEngine = ({ theme, accent, density = 50, reducedMotion = false, customBgUrl }) => {
  
  const speedScale = reducedMotion ? 0.2 : 1;
  const countScale = density / 100;

  const renderBackground = () => {
    if (theme === 'custom-image' && customBgUrl) {
      return (
        <div 
          className="env-custom-bg"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${customBgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.6,
            zIndex: 0,
            filter: 'brightness(0.7)'
          }}
        />
      );
    }

    switch (theme) {
      case 'dither-waves':
        return <Dither color="#ffffff" opacity={0.6} waveSpeed={0.05 * speedScale} />;
      
      case 'magnetic-field':
        return <MagneticParticleField particleColor="#6366f1" opacity={0.4} count={Math.floor(150 * countScale)} />;
      
      case 'circuit-trace':
        return <CircuitBoardTrace traceColor="#10b981" opacity={0.5} speed={speedScale} />;
      
      case 'smoke-drift':
        return <SmokeFogDrift smokeColor="#ffffff" opacity={0.25} speed={speedScale} />;
      
      case 'starfield-warp':
        return <StarfieldWarp starColor="#ffffff" warpSpeed={1.5 * speedScale} count={Math.floor(200 * countScale)} />;
      
      case 'dna-lattice':
        return <DNAHelixLattice nodeColor="#22d3ee" helixColor="rgba(34, 211, 238, 0.2)" />;

      case 'cyber-tunnel':
        return <CyberTunnel color="#8b5cf6" opacity={0.4} speed={speedScale} />;

      case 'comet-shower':
        return <CometShower cometColor="#ffffff" opacity={0.6} speed={speedScale} density={Math.floor(25 * countScale)} />;

      case 'pixel-nebula':
        return <PixelNebula opacity={0.4} speed={speedScale} />;

      default:
        return <Dither color="#ffffff" opacity={0.4} />;
    }
  };

  return (
    <div className="environment-engine-container" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={theme + (theme === 'custom-image' ? customBgUrl : '')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {renderBackground()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default React.memo(EnvironmentEngine);
