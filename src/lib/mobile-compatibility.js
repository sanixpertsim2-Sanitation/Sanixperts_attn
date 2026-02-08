/**
 * SANIXPERT MOBILE UNIVERSAL COMPATIBILITY ENGINE
 * Cross-browser mobile compatibility system
 * Handles Safari, Chrome, Firefox, Edge mobile browsers
 */

class MobileCompatibilityEngine {
  constructor() {
    this.isInitialized = false;
    this.browserInfo = this.detectBrowser();
    this.deviceInfo = this.detectDevice();
    this.touchInfo = this.detectTouchCapabilities();
    this.viewportInfo = this.detectViewportCapabilities();
    this.pwaInfo = this.detectPWACapabilities();
    
    // Event listeners cleanup
    this.eventListeners = new Map();
    this.listenerId = 0;
    this.resizeObserver = null;
    this.intersectionObserver = null;
  }

  /**
   * Initialize the mobile compatibility system
   */
  initialize() {
    if (this.isInitialized) return;

    console.log('🚀 Initializing Mobile Compatibility Engine...');
    console.log('📱 Browser:', this.browserInfo);
    console.log('📱 Device:', this.deviceInfo);
    console.log('👆 Touch:', this.touchInfo);
    console.log('🖼️ Viewport:', this.viewportInfo);
    console.log('📦 PWA:', this.pwaInfo);

    // Apply browser-specific fixes
    this.applyBrowserFixes();
    
    // Setup viewport handling
    this.setupViewportHandling();
    
    // Setup touch optimization
    this.setupTouchOptimization();
    
    // Setup PWA features
    this.setupPWAFeatures();
    
    // Setup responsive handling
    this.setupResponsiveHandling();
    
    // Setup accessibility features
    this.setupAccessibilityFeatures();
    
    this.isInitialized = true;
    console.log('✅ Mobile Compatibility Engine initialized');
  }

  /**
   * Detect browser information
   */
  detectBrowser() {
    const ua = navigator.userAgent;
    const vendor = navigator.vendor || '';
    
    return {
      isSafari: /^((?!chrome|android).)*safari/i.test(ua),
      isChrome: /Chrome/.test(ua) && /Google Inc/.test(vendor),
      isFirefox: /Firefox/.test(ua),
      isEdge: /Edg/.test(ua),
      isSamsung: /SamsungBrowser/.test(ua),
      isOpera: /Opera|OPR/.test(ua),
      isIOS: /iPad|iPhone|iPod/.test(ua),
      isAndroid: /Android/.test(ua),
      version: this.extractVersion(ua),
      engine: this.detectEngine(ua)
    };
  }

  /**
   * Detect device information
   */
  detectDevice() {
    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)|Tablet/i.test(ua);
    
    return {
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet,
      pixelRatio: window.devicePixelRatio || 1,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      orientation: screen.orientation?.type || window.orientation,
      hasNotch: this.detectNotch(),
      safeArea: this.getSafeArea()
    };
  }

  /**
   * Detect touch capabilities
   */
  detectTouchCapabilities() {
    return {
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      maxTouchPoints: navigator.maxTouchPoints || 1,
      touchActionSupported: CSS.supports('touch-action', 'none'),
      forceTouchSupported: 'ontouchforce' in window,
      hoverSupported: window.matchMedia('(hover: hover)').matches
    };
  }

  /**
   * Detect viewport capabilities
   */
  detectViewportCapabilities() {
    return {
      supportsDynamicViewport: CSS.supports('height', '100dvh'),
      supportsSafeArea: CSS.supports('padding', 'env(safe-area-inset-top)'),
      supportsOverscrollBehavior: CSS.supports('overscroll-behavior', 'contain'),
      supportsBackdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
      supportsWebkitBackdropFilter: CSS.supports('-webkit-backdrop-filter', 'blur(10px)')
    };
  }

  /**
   * Detect PWA capabilities
   */
  detectPWACapabilities() {
    return {
      supportsServiceWorker: 'serviceWorker' in navigator,
      supportsManifest: 'onbeforeinstallprompt' in window,
      supportsShare: 'share' in navigator,
      supportsWebShare: 'navigator.share' in window,
      supportsWebAppBanner: 'standalone' in window.navigator,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      isInstalled: this.isPWAInstalled()
    };
  }

  /**
   * Apply browser-specific fixes
   */
  applyBrowserFixes() {
    const { isSafari, isIOS, isChrome, isFirefox } = this.browserInfo;

    // Safari fixes
    if (isSafari) {
      this.applySafariFixes();
    }

    // iOS fixes
    if (isIOS) {
      this.applyIOSFixes();
    }

    // Chrome fixes
    if (isChrome) {
      this.applyChromeFixes();
    }

    // Firefox fixes
    if (isFirefox) {
      this.applyFirefoxFixes();
    }

    // Universal fixes
    this.applyUniversalFixes();
  }

  /**
   * Apply Safari-specific fixes
   */
  applySafariFixes() {
    // Safari viewport height fix
    this.setViewportHeightFix();
    
    // Safari scroll bounce fix
    this.setScrollBounceFix();
    
    // Safari input zoom fix
    this.setInputZoomFix();
    
    // Safari backdrop filter fix
    this.setBackdropFilterFix();
  }

  /**
   * Apply iOS-specific fixes
   */
  applyIOSFixes() {
    // iOS safe area handling
    this.setSafeAreaHandling();
    
    // iOS keyboard handling
    this.setKeyboardHandling();
    
    // iOS orientation handling
    this.setOrientationHandling();
  }

  /**
   * Apply Chrome-specific fixes
   */
  applyChromeFixes() {
    // Chrome overscroll fix
    this.setOverscrollFix();
    
    // Chrome pull-to-refresh fix
    this.setPullToRefreshFix();
  }

  /**
   * Apply Firefox-specific fixes
   */
  applyFirefoxFixes() {
    // Firefox scrollbar fix
    this.setScrollbarFix();
  }

  /**
   * Apply universal fixes
   */
  applyUniversalFixes() {
    // Universal touch optimization
    this.setUniversalTouchOptimization();
    
    // Universal responsive images
    this.setUniversalResponsiveImages();
    
    // Universal form optimization
    this.setUniversalFormOptimization();
  }

  /**
   * Setup viewport handling
   */
  setupViewportHandling() {
    const { supportsDynamicViewport, supportsSafeArea } = this.viewportInfo;

    // Dynamic viewport height support
    if (supportsDynamicViewport) {
      this.setupDynamicViewport();
    }

    // Safe area support
    if (supportsSafeArea) {
      this.setupSafeArea();
    }

    // Viewport change handling
    this.setupViewportChangeHandling();
  }

  /**
   * Setup touch optimization
   */
  setupTouchOptimization() {
    const { hasTouch, touchActionSupported } = this.touchInfo;

    if (!hasTouch) return;

    // Touch action support
    if (touchActionSupported) {
      this.setupTouchActions();
    }

    // Touch feedback
    this.setupTouchFeedback();

    // Gesture handling
    this.setupGestureHandling();
  }

  /**
   * Setup PWA features
   */
  setupPWAFeatures() {
    const { supportsServiceWorker, supportsManifest, isStandalone } = this.pwaInfo;

    // Service worker
    if (supportsServiceWorker) {
      this.setupServiceWorker();
    }

    // App install prompt
    if (supportsManifest && !isStandalone) {
      this.setupInstallPrompt();
    }

    // PWA navigation
    if (isStandalone) {
      this.setupPWANavigation();
    }
  }

  /**
   * Setup responsive handling
   */
  setupResponsiveHandling() {
    // Resize observer
    this.setupResizeObserver();

    // Media query handling
    this.setupMediaQueryHandling();

    // Orientation change handling
    this.setupOrientationChangeHandling();
  }

  /**
   * Setup accessibility features
   */
  setupAccessibilityFeatures() {
    // Reduced motion
    this.setupReducedMotion();

    // High contrast
    this.setupHighContrast();

    // Focus management
    this.setupFocusManagement();
  }

  /**
   * Set viewport height fix for Safari
   */
  setViewportHeightFix() {
    const updateViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Initial set
    updateViewportHeight();

    // Update on resize
    this.addEventListener(window, 'resize', updateViewportHeight);
    this.addEventListener(window, 'orientationchange', updateViewportHeight);
  }

  /**
   * Set scroll bounce fix
   */
  setScrollBounceFix() {
    const preventOverscroll = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const isTop = scrollTop === 0;
      const isBottom = scrollTop + clientHeight >= scrollHeight;
      const isScrollingUp = e.deltaY < 0;
      const isScrollingDown = e.deltaY > 0;

      if ((isTop && isScrollingUp) || (isBottom && isScrollingDown)) {
        e.preventDefault();
      }
    };

    // Apply to scrollable elements
    document.addEventListener('wheel', preventOverscroll, { passive: false });
  }

  /**
   * Set input zoom fix for iOS
   */
  setInputZoomFix() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="number"], textarea, select');
    
    inputs.forEach(input => {
      if (input.fontSize !== '16px') {
        input.style.fontSize = '16px';
      }
    });
  }

  /**
   * Set backdrop filter fix
   */
  setBackdropFilterFix() {
    const { supportsBackdropFilter, supportsWebkitBackdropFilter } = this.viewportInfo;
    
    if (!supportsBackdropFilter && supportsWebkitBackdropFilter) {
      // Fallback for Safari
      const elements = document.querySelectorAll('[style*="backdrop-filter"]');
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const filter = styles.backdropFilter;
        if (filter && filter !== 'none') {
          el.style.webkitBackdropFilter = filter;
        }
      });
    }
  }

  /**
   * Set safe area handling
   */
  setSafeAreaHandling() {
    const root = document.documentElement;
    
    // Set CSS custom properties for safe areas
    const updateSafeArea = () => {
      const style = getComputedStyle(document.body);
      const top = style.getPropertyValue('env(safe-area-inset-top)');
      const bottom = style.getPropertyValue('env(safe-area-inset-bottom)');
      const left = style.getPropertyValue('env(safe-area-inset-left)');
      const right = style.getPropertyValue('env(safe-area-inset-right)');

      if (top) root.style.setProperty('--safe-area-top', top);
      if (bottom) root.style.setProperty('--safe-area-bottom', bottom);
      if (left) root.style.setProperty('--safe-area-left', left);
      if (right) root.style.setProperty('--safe-area-right', right);
    };

    updateSafeArea();
    this.addEventListener(window, 'resize', updateSafeArea);
  }

  /**
   * Set keyboard handling
   */
  setKeyboardHandling() {
    let originalViewportHeight = window.innerHeight;

    const handleKeyboardShow = () => {
      const currentViewportHeight = window.innerHeight;
      const heightDiff = originalViewportHeight - currentViewportHeight;
      
      if (heightDiff > 150) { // Keyboard likely shown
        document.body.classList.add('keyboard-visible');
        // Adjust bottom navigation
        const bottomNav = document.querySelector('.universal-bottom-nav');
        if (bottomNav) {
          bottomNav.style.transform = 'translateY(100%)';
        }
      }
    };

    const handleKeyboardHide = () => {
      document.body.classList.remove('keyboard-visible');
      // Reset bottom navigation
      const bottomNav = document.querySelector('.universal-bottom-nav');
      if (bottomNav) {
        bottomNav.style.transform = 'translateY(0)';
      }
    };

    // Visual Viewport API for better keyboard handling
    if ('visualViewport' in window) {
      window.visualViewport.addEventListener('resize', handleKeyboardShow);
      window.visualViewport.addEventListener('resize', handleKeyboardHide);
    } else {
      // Fallback
      this.addEventListener(window, 'resize', handleKeyboardShow);
      this.addEventListener(window, 'resize', handleKeyboardHide);
    }
  }

  /**
   * Set orientation handling
   */
  setOrientationHandling() {
    const handleOrientationChange = () => {
      const orientation = screen.orientation?.type || window.orientation;
      document.body.setAttribute('data-orientation', orientation);
      
      // Trigger custom event
      const event = new CustomEvent('orientationchange', {
        detail: { orientation }
      });
      document.dispatchEvent(event);
    };

    this.addEventListener(screen.orientation, 'change', handleOrientationChange);
    this.addEventListener(window, 'orientationchange', handleOrientationChange);
  }

  /**
   * Set overscroll fix
   */
  setOverscrollFix() {
    document.body.style.overscrollBehavior = 'contain';
    
    // Prevent pull-to-refresh
    let startY = 0;
    const preventPullToRefresh = (e) => {
      if (document.body.scrollTop === 0 && e.touches[0].clientY > startY) {
        e.preventDefault();
      }
      startY = e.touches[0].clientY;
    };

    document.addEventListener('touchstart', preventPullToRefresh, { passive: false });
  }

  /**
   * Set pull-to-refresh fix
   */
  setPullToRefreshFix() {
    // Disable pull-to-refresh in Chrome
    document.body.style.overscrollBehaviorY = 'contain';
  }

  /**
   * Set scrollbar fix
   */
  setScrollbarFix() {
    // Firefox scrollbar styling
    const style = document.createElement('style');
    style.textContent = `
      * {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Set universal touch optimization
   */
  setUniversalTouchOptimization() {
    // Prevent text selection on touch
    document.addEventListener('selectstart', (e) => {
      if (e.target.closest('.no-select')) {
        e.preventDefault();
      }
    });

    // Prevent context menu on long press
    document.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.no-context-menu')) {
        e.preventDefault();
      }
    });
  }

  /**
   * Set universal responsive images
   */
  setUniversalResponsiveImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy';
      }
      if (!img.decoding) {
        img.decoding = 'async';
      }
    });
  }

  /**
   * Set universal form optimization
   */
  setUniversalFormOptimization() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      // Prevent form submission on enter in mobile
      form.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.type !== 'submit') {
          e.preventDefault();
          const nextInput = form.querySelector('input:not([type="submit"]):not([disabled])');
          if (nextInput) {
            nextInput.focus();
          }
        }
      });
    });
  }

  /**
   * Setup dynamic viewport
   */
  setupDynamicViewport() {
    const updateDynamicViewport = () => {
      const vh = window.innerHeight;
      const dvw = window.innerWidth;
      
      document.documentElement.style.setProperty('--dvwh', `${vh}px`);
      document.documentElement.style.setProperty('--dvww', `${dvw}px`);
    };

    updateDynamicViewport();
    this.addEventListener(window, 'resize', updateDynamicViewport);
    this.addEventListener(window, 'orientationchange', updateDynamicViewport);
  }

  /**
   * Setup safe area
   */
  setupSafeArea() {
    const updateSafeAreaCSS = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(document.body);
      
      const safeAreas = {
        top: computedStyle.getPropertyValue('env(safe-area-inset-top)'),
        bottom: computedStyle.getPropertyValue('env(safe-area-inset-bottom)'),
        left: computedStyle.getPropertyValue('env(safe-area-inset-left)'),
        right: computedStyle.getPropertyValue('env(safe-area-inset-right)')
      };

      Object.entries(safeAreas).forEach(([key, value]) => {
        if (value && value.trim()) {
          root.style.setProperty(`--safe-area-${key}`, value);
        }
      });
    };

    updateSafeAreaCSS();
    this.addEventListener(window, 'resize', updateSafeAreaCSS);
  }

  /**
   * Setup viewport change handling
   */
  setupViewportChangeHandling() {
    const handleViewportChange = () => {
      const event = new CustomEvent('viewportchange', {
        detail: {
          width: window.innerWidth,
          height: window.innerHeight,
          orientation: screen.orientation?.type || window.orientation
        }
      });
      document.dispatchEvent(event);
    };

    this.addEventListener(window, 'resize', handleViewportChange);
    this.addEventListener(window, 'orientationchange', handleViewportChange);
  }

  /**
   * Setup touch actions
   */
  setupTouchActions() {
    const touchElements = document.querySelectorAll('.touch-scroll');
    touchElements.forEach(el => {
      el.style.touchAction = 'pan-y';
    });

    const horizontalScrollElements = document.querySelectorAll('.touch-scroll-horizontal');
    horizontalScrollElements.forEach(el => {
      el.style.touchAction = 'pan-x';
    });
  }

  /**
   * Setup touch feedback
   */
  setupTouchFeedback() {
    const touchElements = document.querySelectorAll('.universal-touch-feedback');
    
    touchElements.forEach(el => {
      el.addEventListener('touchstart', () => {
        el.classList.add('touch-active');
      });
      
      el.addEventListener('touchend', () => {
        setTimeout(() => {
          el.classList.remove('touch-active');
        }, 150);
      });
    });
  }

  /**
   * Setup gesture handling
   */
  setupGestureHandling() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    });

    document.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const deltaTime = touchEndTime - touchStartTime;

      // Detect swipe gestures
      if (deltaTime < 500 && Math.abs(deltaX) > 50 && Math.abs(deltaY) < 50) {
        const direction = deltaX > 0 ? 'right' : 'left';
        const event = new CustomEvent('swipe', {
          detail: { direction, deltaX, deltaY }
        });
        document.dispatchEvent(event);
      }
    });
  }

  /**
   * Setup service worker
   */
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch(error => {
          console.log('❌ Service Worker registration failed:', error);
        });
    }
  }

  /**
   * Setup install prompt
   */
  setupInstallPrompt() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install button
      const installBtn = document.querySelector('.install-app-btn');
      if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.addEventListener('click', () => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
              if (choiceResult.outcome === 'accepted') {
                console.log('✅ App installed');
              }
              deferredPrompt = null;
            });
          }
        });
      }
    });
  }

  /**
   * Setup PWA navigation
   */
  setupPWANavigation() {
    document.body.classList.add('pwa-standalone');
    
    // Handle back button in PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      window.addEventListener('popstate', (e) => {
        if (e.state === null) {
          // Prevent going back to empty state
          window.history.pushState({}, '', window.location.href);
        }
      });
    }
  }

  /**
   * Setup resize observer
   */
  setupResizeObserver() {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
          const event = new CustomEvent('elementresize', {
            detail: {
              element: entry.target,
              width: entry.contentRect.width,
              height: entry.contentRect.height
            }
          });
          document.dispatchEvent(event);
        });
      });

      // Observe key elements
      const elements = document.querySelectorAll('.universal-card, .universal-scroll');
      elements.forEach(el => {
        this.resizeObserver.observe(el);
      });
    }
  }

  /**
   * Setup media query handling
   */
  setupMediaQueryHandling() {
    const mediaQueries = {
      mobile: window.matchMedia('(max-width: 640px)'),
      tablet: window.matchMedia('(min-width: 641px) and (max-width: 768px)'),
      desktop: window.matchMedia('(min-width: 769px)'),
      portrait: window.matchMedia('(orientation: portrait)'),
      landscape: window.matchMedia('(orientation: landscape)')
    };

    Object.entries(mediaQueries).forEach(([name, mq]) => {
      const handler = (e) => {
        const event = new CustomEvent('mediaquerychange', {
          detail: { name, matches: e.matches }
        });
        document.dispatchEvent(event);
      };

      this.addEventListener(mq, 'change', handler);
    });
  }

  /**
   * Setup orientation change handling
   */
  setupOrientationChangeHandling() {
    const handleOrientationChange = () => {
      const orientation = screen.orientation?.type || window.orientation;
      document.body.setAttribute('data-orientation', orientation);
      
      // Update viewport variables
      setTimeout(() => {
        this.updateViewportVariables();
      }, 100);
    };

    this.addEventListener(screen.orientation, 'change', handleOrientationChange);
    this.addEventListener(window, 'orientationchange', handleOrientationChange);
  }

  /**
   * Setup reduced motion
   */
  setupReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotion = (e) => {
      if (e.matches) {
        document.body.classList.add('reduced-motion');
      } else {
        document.body.classList.remove('reduced-motion');
      }
    };

    handleReducedMotion(mediaQuery);
    mediaQuery.addEventListener('change', handleReducedMotion);
  }

  /**
   * Setup high contrast
   */
  setupHighContrast() {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleHighContrast = (e) => {
      if (e.matches) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
    };

    handleHighContrast(mediaQuery);
    mediaQuery.addEventListener('change', handleHighContrast);
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Focus trap for modals
    const setupFocusTrap = (modal) => {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const trapFocus = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      modal.addEventListener('keydown', trapFocus);
    };

    // Auto-setup for new modals
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList.contains('modal')) {
            setupFocusTrap(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Update viewport variables
   */
  updateViewportVariables() {
    const root = document.documentElement;
    root.style.setProperty('--vw', `${window.innerWidth * 0.01}px`);
    root.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    
    if (this.viewportInfo.supportsDynamicViewport) {
      root.style.setProperty('--dvw', `${window.innerWidth * 0.01}px`);
      root.style.setProperty('--dvh', `${window.innerHeight * 0.01}px`);
    }
  }

  /**
   * Add event listener with cleanup tracking
   */
  addEventListener(target, event, handler, options) {
    if (!target || typeof target.addEventListener !== 'function') return;
    target.addEventListener(event, handler, options);
    this.eventListeners.set(`${event}-${this.listenerId++}`, {
      target,
      event,
      handler,
      options
    });
  }

  /**
   * Cleanup all event listeners
   */
  cleanup() {
    // Remove event listeners
    this.eventListeners.forEach(({ target, event, handler, options }) => {
      if (target && typeof target.removeEventListener === 'function') {
        target.removeEventListener(event, handler, options);
      }
    });
    this.eventListeners.clear();

    // Disconnect observers
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    this.isInitialized = false;
  }

  /**
   * Utility methods
   */
  extractVersion(ua) {
    const match = ua.match(/(Chrome|Firefox|Safari|Edge|OPR)\/([\d.]+)/);
    return match ? match[2] : 'unknown';
  }

  detectEngine(ua) {
    if (/WebKit/.test(ua)) return 'WebKit';
    if (/Gecko/.test(ua)) return 'Gecko';
    if (/Presto/.test(ua)) return 'Presto';
    if (/Trident/.test(ua)) return 'Trident';
    return 'unknown';
  }

  detectNotch() {
    return CSS.supports('padding', 'env(safe-area-inset-top)') && 
           parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)')) > 20;
  }

  getSafeArea() {
    const style = getComputedStyle(document.documentElement);
    return {
      top: style.getPropertyValue('env(safe-area-inset-top)'),
      bottom: style.getPropertyValue('env(safe-area-inset-bottom)'),
      left: style.getPropertyValue('env(safe-area-inset-left)'),
      right: style.getPropertyValue('env(safe-area-inset-right)')
    };
  }

  isPWAInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }
}

// Export for use in components
export default MobileCompatibilityEngine;
