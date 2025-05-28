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
    console.log('Showing update notification:', updateInfo);
    setUpdateAvailable(updateInfo);
    setShowUpdatePrompt(true);
    
    // Also show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('App Update Available', {
        body: `Version ${updateInfo.version} is ready to install`,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'app-update',
        requireInteraction: true
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, []);

  // Handle update acceptance
  const handleUpdateAccept = useCallback(async () => {
    if (!updateAvailable) return;
    
    setIsUpdating(true);
    setShowUpdatePrompt(false);
    
    try {
      // Send message to service worker to skip waiting
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
        
        // Wait for the new service worker to take control
        const waitForControllerChange = new Promise<void>((resolve) => {
          const handleControllerChange = () => {
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
            resolve();
          };
          navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
        });
        
        await waitForControllerChange;
      }
      
      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error during update:', error);
      setIsUpdating(false);
      setShowUpdatePrompt(true);
    }
  }, [updateAvailable]);

  // Handle update dismissal
  const handleUpdateDismiss = useCallback(() => {
    setShowUpdatePrompt(false);
    setUpdateAvailable(null);
  }, []);

  // Register service worker and handle updates
  useEffect(() => {
    const { isIOS: deviceIsIOS, isInstalled: appIsInstalled } = checkIfIOS();
    setIsIOS(deviceIsIOS);
    setIsInstalled(appIsInstalled);

    // Show iOS install prompt for iOS devices that aren't installed
    if (deviceIsIOS && !appIsInstalled) {
      setTimeout(() => setShowIOSInstall(true), 2000);
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }

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
            console.log('Received message from SW:', data);

            switch (data.type) {
              case 'SW_UPDATE_AVAILABLE':
                console.log('New version available:', data.version);
                showUpdateNotification({
                  version: data.version,
                  timestamp: data.timestamp
                });
                break;
              
              case 'SW_ACTIVATED':
                console.log('Service Worker activated:', data.version);
                // Could show a brief success message here
                break;
            }
          };

          navigator.serviceWorker.addEventListener('message', handleMessage);

          // Handle when a new service worker is waiting
          const handleWaiting = (worker: ServiceWorker) => {
            console.log('New service worker waiting');
            
            worker.addEventListener('statechange', () => {
              console.log('Worker state changed:', worker.state);
              if (worker.state === 'installed') {
                console.log('New worker installed and waiting');
                // The service worker will send a message, so we don't need to act here
              }
            });
          };

          // Check if there's already a waiting worker
          if (registration.waiting) {
            handleWaiting(registration.waiting);
          }

          // Listen for new workers
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('Update found, new worker installing');
            
            if (newWorker) {
              handleWaiting(newWorker);
            }
          });

          // Handle controller change (new SW activated)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Controller changed - reloading page');
            if (!isUpdating) {
              window.location.reload();
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