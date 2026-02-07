/**
 * SANIXPERT UNIVERSAL CARD
 * Cross-browser mobile card component
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useMobileCompatibility } from './MobileCompatibilityProvider';

export default function UniversalCard({ 
  children, 
  className = '', 
  hover = true,
  clickable = false,
  onClick,
  ...props 
}) {
  const { browserInfo, deviceInfo, touchInfo } = useMobileCompatibility();
  const [isPressed, setIsPressed] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Touch feedback for mobile
    const handleTouchStart = () => {
      setIsPressed(true);
    };

    const handleTouchEnd = () => {
      setTimeout(() => setIsPressed(false), 150);
    };

    // Mouse feedback for desktop
    const handleMouseDown = () => {
      setIsPressed(true);
    };

    const handleMouseUp = () => {
      setTimeout(() => setIsPressed(false), 150);
    };

    if (touchInfo.hasTouch) {
      card.addEventListener('touchstart', handleTouchStart, { passive: true });
      card.addEventListener('touchend', handleTouchEnd, { passive: true });
    } else {
      card.addEventListener('mousedown', handleMouseDown);
      card.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (touchInfo.hasTouch) {
        card.removeEventListener('touchstart', handleTouchStart);
        card.removeEventListener('touchend', handleTouchEnd);
      } else {
        card.removeEventListener('mousedown', handleMouseDown);
        card.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [touchInfo]);

  const cardClasses = [
    'universal-card',
    hover && 'hover-enabled',
    clickable && 'clickable',
    isPressed && 'pressed',
    browserInfo.isSafari && 'safari-card',
    deviceInfo.isIOS && 'ios-card',
    deviceInfo.isAndroid && 'android-card',
    className
  ].filter(Boolean).join(' ');

  const cardProps = {
    ref: cardRef,
    className: cardClasses,
    onClick: clickable ? onClick : undefined,
    role: clickable ? 'button' : undefined,
    tabIndex: clickable ? 0 : undefined,
    'aria-pressed': clickable ? isPressed : undefined,
    ...props
  };

  return (
    <div {...cardProps}>
      {children}
      
      {/* Card styles */}
      <style jsx>{`
        .universal-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          -webkit-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .universal-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s ease;
          -webkit-transition: left 0.5s ease;
        }

        .hover-enabled:hover {
          transform: translateY(-4px);
          -webkit-transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
          -webkit-box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .hover-enabled:hover::before {
          left: 100%;
        }

        .clickable {
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          user-select: none;
          -webkit-user-select: none;
        }

        .clickable:focus {
          outline: 2px solid #22c55e;
          outline-offset: 2px;
        }

        .pressed {
          transform: translateY(-2px) scale(0.98);
          -webkit-transform: translateY(-2px) scale(0.98);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
          -webkit-box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        /* Safari-specific fixes */
        .safari-card {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }

        .safari-card::before {
          -webkit-background-clip: padding-box;
          background-clip: padding-box;
        }

        /* iOS-specific fixes */
        .ios-card {
          -webkit-overflow-scrolling: touch;
        }

        /* Android-specific fixes */
        .android-card {
          overscroll-behavior: contain;
        }

        /* Responsive adjustments */
        @media (max-width: 380px) {
          .universal-card {
            padding: 16px;
            margin-bottom: 12px;
            border-radius: 14px;
          }
        }

        @media (min-width: 769px) {
          .universal-card {
            padding: 24px;
            margin-bottom: 20px;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .universal-card,
          .universal-card::before {
            transition: none;
            -webkit-transition: none;
          }
          
          .hover-enabled:hover {
            transform: none;
            -webkit-transform: none;
          }
          
          .pressed {
            transform: none;
            -webkit-transform: none;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .universal-card {
            border-color: rgba(255, 255, 255, 0.5);
          }
        }

        /* Print styles */
        @media print {
          .universal-card {
            break-inside: avoid;
            box-shadow: none;
            border: 1px solid #ccc;
            background: white;
            color: black;
          }
        }
      `}</style>
    </div>
  );
}
