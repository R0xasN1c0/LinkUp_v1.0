
import { useState, useEffect } from 'react';

type Platform = 'android' | 'ios' | 'web' | 'unknown';
type PlatformInfo = {
  platform: Platform;
  isNative: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isWeb: boolean;
};

export function usePlatform(): PlatformInfo {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    platform: 'unknown',
    isNative: false,
    isAndroid: false,
    isIOS: false,
    isWeb: true
  });

  useEffect(() => {
    // Simple platform detection logic
    const userAgent = navigator.userAgent.toLowerCase();
    let detectedPlatform: Platform = 'web';
    let isNative = false;

    if (/android/.test(userAgent)) {
      detectedPlatform = 'android';
      // Check if running in native container
      isNative = window.location.protocol !== 'http:' && 
                window.location.protocol !== 'https:';
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      detectedPlatform = 'ios';
      // Check if running in native container
      isNative = window.location.protocol !== 'http:' && 
                window.location.protocol !== 'https:';
    }

    setPlatformInfo({
      platform: detectedPlatform,
      isNative: isNative,
      isAndroid: detectedPlatform === 'android',
      isIOS: detectedPlatform === 'ios',
      isWeb: detectedPlatform === 'web'
    });
  }, []);

  return platformInfo;
}
