/**
 * SANIXPERT UNIVERSAL MOBILE LAYOUT
 * Cross-browser mobile layout component
 */

'use client';

import { useEffect, useState } from 'react';
import { useMobileCompatibility } from './MobileCompatibilityProvider';

export default function UniversalMobileLayout({ children }) {
  const { browserInfo, deviceInfo, isMobile, isTablet } = useMobileCompatibility();
  const [viewportHeight, setViewportHeight] = useState('100vh');
  const [safeAreaInsets, setSafeAreaInsets] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  useEffect(() => {
    // Update viewport height for Safari
    const updateViewportHeight = () => {
      if (browserInfo.isSafari || deviceInfo.isIOS) {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        setViewportHeight('calc(100 * var(--vh))');
      }
    };

    // Update safe area insets
    const updateSafeAreaInsets = () => {
      const style = getComputedStyle(document.body);
      const top = parseInt(style.getPropertyValue('env(safe-area-inset-top)')) || 0;
      const bottom = parseInt(style.getPropertyValue('env(safe-area-inset-bottom)')) || 0;
      const left = parseInt(style.getPropertyValue('env(safe-area-inset-left)')) || 0;
      const right = parseInt(style.getPropertyValue('env(safe-area-inset-right)')) || 0;
      
      setSafeAreaInsets({ top, bottom, left, right });
      
      // Set CSS custom properties
      document.documentElement.style.setProperty('--safe-area-top', `${top}px`);
      document.documentElement.style.setProperty('--safe-area-bottom', `${bottom}px`);
      document.documentElement.style.setProperty('--safe-area-left', `${left}px`);
      document.documentElement.style.setProperty('--safe-area-right', `${right}px`);
    };

    updateViewportHeight();
    updateSafeAreaInsets();

    // Event listeners
    const handleResize = () => {
      updateViewportHeight();
      updateSafeAreaInsets();
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        updateViewportHeight();
        updateSafeAreaInsets();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Visual Viewport API for better keyboard handling
    if ('visualViewport' in window) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if ('visualViewport' in window) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [browserInfo, deviceInfo]);

  const layoutClasses = [
    'universal-mobile-layout',
    isMobile && 'mobile-layout',
    isTablet && 'tablet-layout',
    browserInfo.isSafari && 'safari-layout',
    deviceInfo.isIOS && 'ios-layout',
    deviceInfo.isAndroid && 'android-layout'
  ].filter(Boolean).join(' ');

  const layoutStyles = {
    height: viewportHeight,
    paddingTop: `${safeAreaInsets.top}px`,
    paddingBottom: `${safeAreaInsets.bottom}px`,
    paddingLeft: `${safeAreaInsets.left}px`,
    paddingRight: `${safeAreaInsets.right}px`,
  };

  return (
    <div 
      className={layoutClasses}
      style={layoutStyles}
    >
      <div className="universal-mobile-content">
        {children}
      </div>
      
      {/* Mobile-specific styles */}
      <style jsx>{`
        .universal-mobile-layout {
          width: 100%;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background: var(--background, #05070c);
        }

        .universal-mobile-content {
          width: 100%;
          height: 100%;
          position: relative;
        }

        /* Safari-specific fixes */
        .safari-layout {
          -webkit-overflow-scrolling: touch;
          -webkit-text-size-adjust: 100%;
        }

        .safari-layout * {
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
        }

        /* iOS-specific fixes */
        .ios-layout {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }

        /* Android-specific fixes */
        .android-layout {
          overscroll-behavior: contain;
        }

        /* Mobile-specific adjustments */
        .mobile-layout {
          font-size: 16px; /* Prevent zoom on iOS */
        }

        .mobile-layout input,
        .mobile-layout select,
        .mobile-layout textarea {
          font-size: 16px !important;
        }

        /* Tablet-specific adjustments */
        .tablet-layout {
          max-width: 1024px;
          margin: 0 auto;
        }

        /* Keyboard handling */
        .keyboard-visible .universal-mobile-layout {
          height: calc(100vh - var(--keyboard-height, 0px));
        }

        /* Orientation adjustments */
        @media (orientation: landscape) {
          .universal-mobile-layout {
            min-height: 100vh;
          }
        }

        /* Small screen adjustments */
        @media (max-width: 380px) {
          .universal-mobile-layout {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
