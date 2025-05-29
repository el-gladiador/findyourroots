'use client';

import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface UpdateInfo {
  version: string;
  timestamp: number;
}

export default function PWAHandler() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstall, setShowIOSInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dismissedUpdate, setDismissedUpdate] = useState<string | null>(null);

  // Check if device is iOS
  const checkIfIOS = useCallback(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as { opera?: string }).opera || '';
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as { MSStream?: unknown }).MSStream;
    const isInWebApp = (window.navigator as { standalone?: boolean }).standalone === true;
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    
    return {
      isIOS: isIOSDevice,
      isInstalled: isInWebApp || isInStandaloneMode
    };
  }, []);

  // Show update notification
  const showUpdateNotification = useCallback((updateInfo: UpdateInfo) => {
    console.log('PWA Handler: Checking if update notification should be shown:', updateInfo);
    
    // Don't show if this version was already dismissed recently
    if (dismissedUpdate === updateInfo.version) {
      console.log('PWA Handler: Update notification dismissed recently, not showing again');
      return;
    }
    
    // Don't show if we already have an update prompt showing for this version
    if (updateAvailable && updateAvailable.version === updateInfo.version) {
      console.log('PWA Handler: Update notification already showing for this version');
      return;
    }
    
    // Don't show if we're currently updating
    if (isUpdating) {
      console.log('PWA Handler: Update in progress, not showing new notification');
      return;
    }
    
    console.log('PWA Handler: Showing update notification for version:', updateInfo.version);
    setUpdateAvailable(updateInfo);
    setShowUpdatePrompt(true);
  }, [dismissedUpdate, updateAvailable, isUpdating]);

  // Handle update acceptance
  const handleUpdateAccept = useCallback(async () => {
    if (!updateAvailable) return;
    
    console.log('PWA Handler: User accepted update for version:', updateAvailable.version);
    setIsUpdating(true);
    setShowUpdatePrompt(false);
    
    // Clear the dismissed update state to prevent conflicts
    setDismissedUpdate(null);
    
    try {
      console.log('PWA Handler: Starting update process...');
      
      // Send message to service worker to skip waiting
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        console.log('PWA Handler: Sending skipWaiting message to current controller');
        navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
      }
      
      // Also try to find waiting service worker
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        console.log('PWA Handler: Found waiting service worker, sending skipWaiting message');
        registration.waiting.postMessage({ action: 'skipWaiting' });
      }
      
      // Wait a bit for the service worker to process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force reload the page
      console.log('PWA Handler: Forcing page reload');
      window.location.reload();
    } catch (error) {
      console.error('PWA Handler: Error during update:', error);
      
      // Reset state on error and force reload anyway
      console.log('PWA Handler: Error occurred, forcing reload anyway');
      window.location.reload();
    }
  }, [updateAvailable]);

  // Handle update dismissal
  const handleUpdateDismiss = useCallback(() => {
    if (updateAvailable) {
      console.log('User dismissed update notification for version:', updateAvailable.version);
      setDismissedUpdate(updateAvailable.version);
      
      // Re-show the notification after 30 minutes (1800000 ms)
      setTimeout(() => {
        console.log('Re-enabling update notification after 30 minutes');
        setDismissedUpdate(null);
      }, 30 * 60 * 1000);
    }
    
    setShowUpdatePrompt(false);
    setUpdateAvailable(null);
  }, [updateAvailable]);

  // Register service worker and handle updates
  useEffect(() => {
    const { isIOS: deviceIsIOS, isInstalled: appIsInstalled } = checkIfIOS();
    setIsIOS(deviceIsIOS);
    setIsInstalled(appIsInstalled);

    // Clear any potentially problematic dismissed version state on mount
    // This helps if the service worker version was reverted and caused conflicts
    setDismissedUpdate(null);

    // Show iOS install prompt for iOS devices that aren't installed
    if (deviceIsIOS && !appIsInstalled) {
      setTimeout(() => setShowIOSInstall(true), 2000);
    }

    // We're using in-app notifications instead of browser notifications for better UX

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { 
          scope: '/',
          updateViaCache: 'none' // Always check for updates
        })
        .then((registration) => {
          console.log('Service Worker registered successfully');

          // Check for updates every 30 seconds when page is visible
          const checkForUpdates = () => {
            if (!document.hidden) {
              registration.update();
            }
          };

          // Initial check after 1 second
          setTimeout(checkForUpdates, 1000);
          
          // Periodic checks
          const updateInterval = setInterval(checkForUpdates, 30000);

          // Handle service worker messages
          const handleMessage = (event: MessageEvent) => {
            const { data } = event;
            console.log('PWA Handler: Received message from SW:', data);

            switch (data.type) {
              case 'SW_UPDATE_AVAILABLE':
                console.log('PWA Handler: New version available:', data.version);
                showUpdateNotification({
                  version: data.version,
                  timestamp: data.timestamp
                });
                break;
              
              case 'SW_ACTIVATED':
                console.log('PWA Handler: Service Worker activated:', data.version);
                // Reset updating state when SW is activated
                setIsUpdating(false);
                break;
                
              case 'SW_VERSION_INFO':
                // Only log version info, don't show notification
                // This prevents notification loops
                console.log('PWA Handler: Received version info from SW:', data.version);
                break;
            }
          };

          navigator.serviceWorker.addEventListener('message', handleMessage);

          // Check if there's already a waiting worker
          if (registration.waiting) {
            console.log('PWA Handler: Found existing waiting worker on page load');
            // Don't automatically request version - let the service worker notify us when appropriate
            console.log('PWA Handler: Waiting for service worker to send update notification');
          }

          // Listen for new workers
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('Update found, new worker installing');
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                console.log('Installing worker state changed:', newWorker.state);
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // There's an existing service worker, this is an update
                    console.log('PWA Handler: Update available - new worker installed');
                    // Don't automatically request version - wait for the service worker to notify us
                    console.log('PWA Handler: Waiting for activation to trigger update notification');
                  } else {
                    // First install
                    console.log('PWA Handler: First service worker installation');
                  }
                }
              });
            }
          });

          // Cleanup
          return () => {
            clearInterval(updateInterval);
            navigator.serviceWorker.removeEventListener('message', handleMessage);
          };
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('Install prompt intercepted');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Handle app installed
    const handleAppInstalled = () => {
      console.log('App installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkIfIOS, showUpdateNotification, isUpdating]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log('Install prompt result:', outcome);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Don't render anything if app is already installed
  if (isInstalled && !isInstallable && !showUpdatePrompt) {
    return null;
  }

  return (
    <>
      {/* Install Button for Non-iOS */}
      {isInstallable && !isInstalled && !isIOS && (
        <div className="fixed bottom-4 right-4 z-50 ios-safe-bottom">
          <button
            onClick={handleInstallClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors duration-200"
            aria-label="Install Family Tree App"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            Install App
          </button>
        </div>
      )}

      {/* iOS Install Instructions */}
      {showIOSInstall && isIOS && !isInstalled && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm ios-safe-bottom">
          <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg relative">
            <button
              onClick={() => setShowIOSInstall(false)}
              className="absolute top-2 right-2 text-white hover:text-gray-200"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="pr-6">
              <h3 className="font-semibold mb-2">Install Family Tree</h3>
              <div className="text-sm space-y-2">
                <p>To install this app on your iOS device:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Tap the Share button <span className="inline-block">📤</span> in Safari</li>
                  <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                  <li>Tap &quot;Add&quot; to confirm</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Notification Banner */}
      {showUpdatePrompt && updateAvailable && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="flex-shrink-0 mr-3">
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  New version available (v{updateAvailable.version})
                </p>
                <p className="text-sm text-blue-100">
                  Update now to get the latest features and improvements
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={handleUpdateAccept}
                disabled={isUpdating}
                className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
              <button
                onClick={handleUpdateDismiss}
                className="text-blue-100 hover:text-white px-3 py-2 text-sm"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}