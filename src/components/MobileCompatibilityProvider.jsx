/**
 * SANIXPERT MOBILE COMPATIBILITY PROVIDER
 * React component for mobile compatibility across all browsers
 */

'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import MobileCompatibilityEngine from '../lib/mobile-compatibility';

const MobileContext = createContext();

export function MobileCompatibilityProvider({ children }) {
  const [mobileEngine, setMobileEngine] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({});
  const [deviceInfo, setDeviceInfo] = useState({});

  useEffect(() => {
    // Initialize mobile compatibility engine
    const engine = new MobileCompatibilityEngine();
    engine.initialize();
    
    setMobileEngine(engine);
    setIsMobile(engine.deviceInfo.isMobile);
    setBrowserInfo(engine.browserInfo);
    setDeviceInfo(engine.deviceInfo);

    // Add mobile-specific classes to body
    document.body.classList.add('mobile-optimized');
    
    if (engine.browserInfo.isSafari) {
      document.body.classList.add('safari-browser');
    }
    
    if (engine.browserInfo.isIOS) {
      document.body.classList.add('ios-device');
    }
    
    if (engine.browserInfo.isAndroid) {
      document.body.classList.add('android-device');
    }

    // Cleanup on unmount
    return () => {
      if (engine) {
        engine.cleanup();
      }
      document.body.classList.remove('mobile-optimized', 'safari-browser', 'ios-device', 'android-device');
    };
  }, []);

  const contextValue = {
    mobileEngine,
    isMobile,
    browserInfo,
    deviceInfo,
    isSafari: browserInfo.isSafari,
    isIOS: deviceInfo.isIOS,
    isAndroid: deviceInfo.isAndroid,
    isTablet: deviceInfo.isTablet
  };

  return (
    <MobileContext.Provider value={contextValue}>
      {children}
    </MobileContext.Provider>
  );
}

export function useMobileCompatibility() {
  const context = useContext(MobileContext);
  if (!context) {
    throw new Error('useMobileCompatibility must be used within MobileCompatibilityProvider');
  }
  return context;
}

export default MobileCompatibilityProvider;
