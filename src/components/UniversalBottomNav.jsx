/**
 * SANIXPERT UNIVERSAL BOTTOM NAVIGATION
 * Cross-browser mobile bottom navigation
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMobileCompatibility } from './MobileCompatibilityProvider';

const navItems = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    )
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    )
  },
  {
    id: 'macy',
    label: 'MACY',
    href: '/macy/lines',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
      </svg>
    )
  },
  {
    id: 'help',
    label: 'Help',
    href: '/help',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    )
  }
];

export default function UniversalBottomNav() {
  const pathname = usePathname();
  const { browserInfo, deviceInfo, isMobile } = useMobileCompatibility();
  const [isVisible, setIsVisible] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!isMobile) return;

    // Handle keyboard visibility
    const handleKeyboardShow = () => {
      const currentHeight = window.innerHeight;
      const initialHeight = window.screen.height;
      const heightDiff = initialHeight - currentHeight;
      
      if (heightDiff > 150) {
        setKeyboardHeight(heightDiff);
        setIsVisible(false);
      }
    };

    const handleKeyboardHide = () => {
      setKeyboardHeight(0);
      setIsVisible(true);
    };

    // Visual Viewport API for better keyboard handling
    if ('visualViewport' in window) {
      window.visualViewport.addEventListener('resize', () => {
        const height = window.visualViewport.height;
        const screenHeight = window.screen.height;
        const heightDiff = screenHeight - height;
        
        if (heightDiff > 150) {
          setKeyboardHeight(heightDiff);
          setIsVisible(false);
        } else {
          setKeyboardHeight(0);
          setIsVisible(true);
        }
      });
    } else {
      // Fallback
      window.addEventListener('resize', handleKeyboardShow);
      window.addEventListener('resize', handleKeyboardHide);
    }

    // Handle orientation changes
    const handleOrientationChange = () => {
      setTimeout(() => {
        setKeyboardHeight(0);
        setIsVisible(true);
      }, 500);
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleKeyboardShow);
      window.removeEventListener('resize', handleKeyboardHide);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isMobile]);

  if (!isMobile) return null;

  const navClasses = [
    'universal-bottom-nav',
    !isVisible && 'keyboard-hidden',
    browserInfo.isSafari && 'safari-nav',
    deviceInfo.isIOS && 'ios-nav',
    deviceInfo.isAndroid && 'android-nav'
  ].filter(Boolean).join(' ');

  const navStyles = {
    transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
    height: isVisible ? 'calc(60px + env(safe-area-inset-bottom))' : '0px',
    paddingBottom: isVisible ? 'env(safe-area-inset-bottom)' : '0px'
  };

  return (
    <nav className={navClasses} style={navStyles}>
      <div className="nav-content">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const itemClasses = [
            'nav-item',
            isActive && 'active',
            'universal-touch-target'
          ].filter(Boolean).join(' ');

          return (
            <Link
              key={item.id}
              href={item.href}
              className={itemClasses}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="nav-icon">
                {item.icon}
              </div>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom navigation styles */}
      <style jsx>{`
        .universal-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(5, 7, 12, 0.98);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 1000;
          transition: transform 0.3s ease, height 0.3s ease;
          -webkit-transition: transform 0.3s ease, height 0.3s ease;
        }

        .nav-content {
          display: flex;
          align-items: center;
          justify-content: space-around;
          height: 60px;
          padding: 0 16px;
          max-width: 600px;
          margin: 0 auto;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 60px;
          height: 44px;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          border-radius: 12px;
          padding: 8px 12px;
          transition: all 0.3s ease;
          -webkit-transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .nav-item:hover {
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-item.active {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
        }

        .nav-icon {
          width: 20px;
          height: 20px;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
          line-height: 1;
        }

        /* Safari-specific fixes */
        .safari-nav {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }

        /* iOS-specific fixes */
        .ios-nav {
          -webkit-tap-highlight-color: transparent;
        }

        /* Android-specific fixes */
        .android-nav {
          overscroll-behavior: contain;
        }

        /* Keyboard hidden state */
        .keyboard-hidden {
          pointer-events: none;
        }

        /* Touch feedback */
        .nav-item:active {
          transform: scale(0.95);
          -webkit-transform: scale(0.95);
        }

        /* Active indicator */
        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 3px;
          background: #22c55e;
          border-radius: 2px;
        }

        /* Responsive adjustments */
        @media (max-width: 380px) {
          .nav-content {
            padding: 0 12px;
          }
          
          .nav-item {
            min-width: 50px;
            padding: 6px 8px;
          }
          
          .nav-icon {
            width: 18px;
            height: 18px;
          }
          
          .nav-label {
            font-size: 10px;
          }
        }

        /* Landscape adjustments */
        @media (orientation: landscape) and (max-height: 500px) {
          .universal-bottom-nav {
            height: 50px !important;
          }
          
          .nav-content {
            height: 50px;
          }
          
          .nav-item {
            min-width: 50px;
            height: 40px;
            padding: 4px 8px;
          }
          
          .nav-icon {
            width: 18px;
            height: 18px;
            margin-bottom: 2px;
          }
          
          .nav-label {
            font-size: 9px;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .universal-bottom-nav,
          .nav-item {
            transition: none;
            -webkit-transition: none;
          }
        }
      `}</style>
    </nav>
  );
}
