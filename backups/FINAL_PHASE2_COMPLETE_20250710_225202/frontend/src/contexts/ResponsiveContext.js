/**
 * Enhanced Mobile Responsiveness Framework for PathwayIQ
 * Phase 2.2: Technical Infrastructure
 * 
 * Chief Technical Architect Implementation
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';

// Breakpoint configuration
export const BREAKPOINTS = {
  xs: '(max-width: 475px)',
  sm: '(max-width: 640px)',
  md: '(max-width: 768px)',
  lg: '(max-width: 1024px)',
  xl: '(max-width: 1280px)',
  '2xl': '(max-width: 1536px)',
  
  // Custom breakpoints for PathwayIQ
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  
  // Orientation
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  
  // Touch capability
  touch: '(pointer: coarse)',
  mouse: '(pointer: fine)',
  
  // High DPI displays
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'
};

// Device type detection
export const DeviceType = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop'
};

// Responsive context
const ResponsiveContext = createContext();

export const ResponsiveProvider = ({ children }) => {
  const [deviceType, setDeviceType] = useState(DeviceType.DESKTOP);
  const [orientation, setOrientation] = useState('landscape');
  const [touchDevice, setTouchDevice] = useState(false);
  const [networkInfo, setNetworkInfo] = useState({ type: 'unknown', downlink: 0 });
  
  // Media queries
  const isMobile = useMediaQuery({ query: BREAKPOINTS.mobile });
  const isTablet = useMediaQuery({ query: BREAKPOINTS.tablet });
  const isDesktop = useMediaQuery({ query: BREAKPOINTS.desktop });
  const isPortrait = useMediaQuery({ query: BREAKPOINTS.portrait });
  const isTouch = useMediaQuery({ query: BREAKPOINTS.touch });
  const isRetina = useMediaQuery({ query: BREAKPOINTS.retina });
  
  // Screen size detection
  const isXS = useMediaQuery({ query: BREAKPOINTS.xs });
  const isSM = useMediaQuery({ query: BREAKPOINTS.sm });
  const isMD = useMediaQuery({ query: BREAKPOINTS.md });
  const isLG = useMediaQuery({ query: BREAKPOINTS.lg });
  const isXL = useMediaQuery({ query: BREAKPOINTS.xl });
  const is2XL = useMediaQuery({ query: BREAKPOINTS['2xl'] });
  
  useEffect(() => {
    // Determine device type
    if (isMobile) {
      setDeviceType(DeviceType.MOBILE);
    } else if (isTablet) {
      setDeviceType(DeviceType.TABLET);
    } else {
      setDeviceType(DeviceType.DESKTOP);
    }
    
    // Set orientation
    setOrientation(isPortrait ? 'portrait' : 'landscape');
    
    // Set touch capability
    setTouchDevice(isTouch);
    
    // Network information (if available)
    if ('connection' in navigator) {
      const connection = navigator.connection;
      setNetworkInfo({
        type: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0
      });
    }
    
  }, [isMobile, isTablet, isDesktop, isPortrait, isTouch]);
  
  const value = {
    // Device detection
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    
    // Screen sizes
    isXS,
    isSM,
    isMD,
    isLG,
    isXL,
    is2XL,
    
    // Device capabilities
    orientation,
    isPortrait,
    isLandscape: !isPortrait,
    touchDevice,
    isTouch,
    isMouse: !isTouch,
    isRetina,
    
    // Network info
    networkInfo,
    
    // Utility functions
    getOptimalImageSize: () => {
      if (isMobile) return isRetina ? 'medium' : 'small';
      if (isTablet) return isRetina ? 'large' : 'medium';
      return isRetina ? 'xlarge' : 'large';
    },
    
    getOptimalColumnsCount: () => {
      if (isXS) return 1;
      if (isSM) return 2;
      if (isMD) return 2;
      if (isLG) return 3;
      if (isXL) return 4;
      return 4;
    },
    
    shouldUseVirtualization: () => {
      return isMobile || networkInfo.type === 'slow-2g' || networkInfo.type === '2g';
    },
    
    getPerformanceMode: () => {
      if (isMobile && (networkInfo.type === 'slow-2g' || networkInfo.type === '2g')) {
        return 'low';
      }
      if (isMobile || networkInfo.type === '3g') {
        return 'medium';
      }
      return 'high';
    }
  };
  
  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export const useResponsive = () => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within ResponsiveProvider');
  }
  return context;
};

// Responsive component wrapper
export const ResponsiveWrapper = ({ 
  children, 
  mobile, 
  tablet, 
  desktop,
  fallback = null 
}) => {
  const { deviceType } = useResponsive();
  
  switch (deviceType) {
    case DeviceType.MOBILE:
      return mobile || fallback || children;
    case DeviceType.TABLET:
      return tablet || fallback || children;
    case DeviceType.DESKTOP:
      return desktop || fallback || children;
    default:
      return children;
  }
};

// Adaptive component for different screen sizes
export const AdaptiveComponent = ({ 
  xs, sm, md, lg, xl, xxl, 
  children, 
  fallback = null 
}) => {
  const responsive = useResponsive();
  
  if (responsive.isXS && xs) return xs;
  if (responsive.isSM && sm) return sm;
  if (responsive.isMD && md) return md;
  if (responsive.isLG && lg) return lg;
  if (responsive.isXL && xl) return xl;
  if (responsive.is2XL && xxl) return xxl;
  
  return fallback || children;
};

// Performance-aware image component
export const ResponsiveImage = ({ 
  src, 
  alt, 
  className = '',
  loading = 'lazy',
  ...props 
}) => {
  const { getOptimalImageSize, isRetina, networkInfo } = useResponsive();
  const [imageSrc, setImageSrc] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    const size = getOptimalImageSize();
    const quality = networkInfo.type === 'slow-2g' || networkInfo.type === '2g' ? 'low' : 'high';
    
    // Generate optimized image URL (placeholder logic)
    let optimizedSrc = src;
    if (typeof src === 'string' && src.includes('.')) {
      const [name, ext] = src.rsplit('.', 1);
      optimizedSrc = `${name}_${size}_${quality}.${ext}`;
    }
    
    setImageSrc(optimizedSrc);
  }, [src, getOptimalImageSize, networkInfo]);
  
  return (
    <div className={`relative ${className}`}>
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse rounded"></div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        loading={loading}
        className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImageLoaded(true)}
        {...props}
      />
    </div>
  );
};

// Virtualized list for mobile performance
export const ResponsiveList = ({ 
  items, 
  renderItem, 
  className = '',
  itemHeight = 60,
  maxVisibleItems = 50 
}) => {
  const { shouldUseVirtualization, isMobile } = useResponsive();
  const [visibleItems, setVisibleItems] = useState(items.slice(0, maxVisibleItems));
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (shouldUseVirtualization() && items.length > maxVisibleItems) {
      // Implement virtual scrolling logic
      setVisibleItems(items.slice(0, maxVisibleItems));
    } else {
      setVisibleItems(items);
    }
  }, [items, shouldUseVirtualization, maxVisibleItems]);
  
  const loadMoreItems = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setTimeout(() => {
      const currentLength = visibleItems.length;
      const nextItems = items.slice(currentLength, currentLength + maxVisibleItems);
      setVisibleItems(prev => [...prev, ...nextItems]);
      setIsLoading(false);
    }, 300);
  };
  
  if (shouldUseVirtualization()) {
    return (
      <div className={className}>
        {visibleItems.map((item, index) => (
          <div key={index} style={{ minHeight: itemHeight }}>
            {renderItem(item, index)}
          </div>
        ))}
        
        {visibleItems.length < items.length && (
          <div className="p-4 text-center">
            <button
              onClick={loadMoreItems}
              disabled={isLoading}
              className="btn-secondary"
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={index}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};

// Responsive grid component
export const ResponsiveGrid = ({ 
  children, 
  className = '',
  minItemWidth = 300,
  gap = 'gap-4' 
}) => {
  const { getOptimalColumnsCount } = useResponsive();
  const columns = getOptimalColumnsCount();
  
  return (
    <div 
      className={`grid ${gap} ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr))`,
        gridTemplateColumns: `repeat(${columns}, 1fr)`
      }}
    >
      {children}
    </div>
  );
};

// Touch-optimized button
export const ResponsiveButton = ({ 
  children, 
  className = '', 
  size = 'medium',
  ...props 
}) => {
  const { touchDevice, isMobile } = useResponsive();
  
  const sizeClasses = {
    small: touchDevice ? 'px-4 py-3 text-sm' : 'px-3 py-2 text-sm',
    medium: touchDevice ? 'px-6 py-4 text-base' : 'px-4 py-2 text-base',
    large: touchDevice ? 'px-8 py-5 text-lg' : 'px-6 py-3 text-lg'
  };
  
  const touchClasses = touchDevice 
    ? 'active:scale-95 touch-manipulation' 
    : 'hover:scale-105';
  
  return (
    <button
      className={`
        transition-all duration-200 
        ${sizeClasses[size]} 
        ${touchClasses} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// Responsive navigation component
export const ResponsiveNavigation = ({ 
  items, 
  className = '',
  mobileBreakpoint = 'md' 
}) => {
  const responsive = useResponsive();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isMobileNav = responsive[`is${mobileBreakpoint.toUpperCase()}`] || responsive.isMobile;
  
  if (isMobileNav) {
    return (
      <div className={className}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md text-gray-400 hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-gray-900 shadow-lg z-50">
            {items.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <nav className={`flex space-x-4 ${className}`}>
      {items.map((item, index) => (
        <a
          key={index}
          href={item.href}
          className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition-colors"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
};

// Performance monitoring hook
export const usePerformanceOptimization = () => {
  const { getPerformanceMode, networkInfo, isMobile } = useResponsive();
  const [performanceSettings, setPerformanceSettings] = useState({});
  
  useEffect(() => {
    const mode = getPerformanceMode();
    
    const settings = {
      low: {
        animationsEnabled: false,
        imageQuality: 'low',
        preloadImages: false,
        virtualizeList: true,
        reducedMotion: true
      },
      medium: {
        animationsEnabled: true,
        imageQuality: 'medium',
        preloadImages: false,
        virtualizeList: isMobile,
        reducedMotion: false
      },
      high: {
        animationsEnabled: true,
        imageQuality: 'high',
        preloadImages: true,
        virtualizeList: false,
        reducedMotion: false
      }
    };
    
    setPerformanceSettings(settings[mode]);
  }, [getPerformanceMode, networkInfo, isMobile]);
  
  return performanceSettings;
};

// Utility functions
export const responsive = {
  // Check if current screen size matches breakpoint
  matches: (breakpoint) => {
    return window.matchMedia(BREAKPOINTS[breakpoint]).matches;
  },
  
  // Get current device type
  getDeviceType: () => {
    if (responsive.matches('mobile')) return DeviceType.MOBILE;
    if (responsive.matches('tablet')) return DeviceType.TABLET;
    return DeviceType.DESKTOP;
  },
  
  // Generate responsive class names
  generateClasses: (baseClass, modifiers = {}) => {
    let classes = baseClass;
    
    Object.entries(modifiers).forEach(([breakpoint, modifier]) => {
      if (breakpoint === 'default') {
        classes += ` ${modifier}`;
      } else {
        classes += ` ${breakpoint}:${modifier}`;
      }
    });
    
    return classes;
  }
};

export default {
  ResponsiveProvider,
  useResponsive,
  ResponsiveWrapper,
  AdaptiveComponent,
  ResponsiveImage,
  ResponsiveList,
  ResponsiveGrid,
  ResponsiveButton,
  ResponsiveNavigation,
  usePerformanceOptimization,
  responsive,
  BREAKPOINTS,
  DeviceType
};