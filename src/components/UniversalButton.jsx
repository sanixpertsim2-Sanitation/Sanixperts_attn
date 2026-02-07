/**
 * SANIXPERT UNIVERSAL BUTTON
 * Cross-browser mobile button component
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useMobileCompatibility } from './MobileCompatibilityProvider';

export default function UniversalButton({ 
  children, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  className = '',
  ...props 
}) {
  const { browserInfo, deviceInfo, touchInfo } = useMobileCompatibility();
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button || disabled || loading) return;

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
      button.addEventListener('touchstart', handleTouchStart, { passive: true });
      button.addEventListener('touchend', handleTouchEnd, { passive: true });
    } else {
      button.addEventListener('mousedown', handleMouseDown);
      button.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (touchInfo.hasTouch) {
        button.removeEventListener('touchstart', handleTouchStart);
        button.removeEventListener('touchend', handleTouchEnd);
      } else {
        button.removeEventListener('mousedown', handleMouseDown);
        button.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [touchInfo, disabled, loading]);

  const buttonClasses = [
    'universal-button',
    `variant-${variant}`,
    `size-${size}`,
    fullWidth && 'full-width',
    isPressed && 'pressed',
    disabled && 'disabled',
    loading && 'loading',
    browserInfo.isSafari && 'safari-button',
    deviceInfo.isIOS && 'ios-button',
    deviceInfo.isAndroid && 'android-button',
    className
  ].filter(Boolean).join(' ');

  const buttonProps = {
    ref: buttonRef,
    className: buttonClasses,
    onClick: disabled || loading ? undefined : onClick,
    disabled: disabled || loading,
    'aria-disabled': disabled || loading,
    'aria-busy': loading,
    ...props
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="button-spinner" />
          <span className="button-text">{children}</span>
        </>
      );
    }

    return <span className="button-text">{children}</span>;
  };

  return (
    <button {...buttonProps}>
      {renderContent()}
      
      {/* Button styles */}
      <style jsx>{`
        .universal-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 44px;
          min-width: 44px;
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          font-family: inherit;
          line-height: 1;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          -webkit-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          user-select: none;
          -webkit-user-select: none;
        }

        /* Variants */
        .variant-primary {
          background: linear-gradient(135deg, #22c55e, #2dd4bf);
          color: white;
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
          -webkit-box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
        }

        .variant-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          -webkit-transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(34, 197, 94, 0.4);
          -webkit-box-shadow: 0 8px 30px rgba(34, 197, 94, 0.4);
        }

        .variant-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .variant-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
          -webkit-transform: translateY(-1px);
        }

        .variant-danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
          -webkit-box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
        }

        .variant-danger:hover:not(:disabled) {
          transform: translateY(-2px);
          -webkit-transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(239, 68, 68, 0.4);
          -webkit-box-shadow: 0 8px 30px rgba(239, 68, 68, 0.4);
        }

        /* Sizes */
        .size-small {
          min-height: 36px;
          padding: 8px 16px;
          font-size: 14px;
        }

        .size-large {
          min-height: 52px;
          padding: 16px 32px;
          font-size: 18px;
        }

        /* States */
        .pressed {
          transform: translateY(0) scale(0.98);
          -webkit-transform: translateY(0) scale(0.98);
        }

        .disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        .loading {
          cursor: wait;
          pointer-events: none;
        }

        .full-width {
          width: 100%;
        }

        /* Ripple effect */
        .universal-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
          -webkit-transition: width 0.6s, height 0.6s;
        }

        .pressed::before {
          width: 300px;
          height: 300px;
        }

        /* Spinner */
        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          -webkit-animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
            -webkit-transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
            -webkit-transform: rotate(360deg);
          }
        }

        /* Text */
        .button-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Safari-specific fixes */
        .safari-button {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }

        /* iOS-specific fixes */
        .ios-button {
          -webkit-font-smoothing: antialiased;
        }

        /* Android-specific fixes */
        .android-button {
          overscroll-behavior: contain;
        }

        /* Focus styles */
        .universal-button:focus-visible {
          outline: 2px solid #22c55e;
          outline-offset: 2px;
        }

        /* Responsive adjustments */
        @media (max-width: 380px) {
          .universal-button {
            padding: 10px 20px;
            font-size: 14px;
          }
          
          .size-small {
            min-height: 32px;
            padding: 6px 12px;
            font-size: 12px;
          }
          
          .size-large {
            min-height: 48px;
            padding: 14px 28px;
            font-size: 16px;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .universal-button,
          .universal-button::before,
          .button-spinner {
            transition: none;
            -webkit-transition: none;
            animation: none;
            -webkit-animation: none;
          }
          
          .pressed {
            transform: none;
            -webkit-transform: none;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .variant-secondary {
            border: 2px solid currentColor;
          }
        }

        /* Print styles */
        @media print {
          .universal-button {
            break-inside: avoid;
            background: white !important;
            color: black !important;
            border: 1px solid black !important;
          }
        }
      `}</style>
    </button>
  );
}
