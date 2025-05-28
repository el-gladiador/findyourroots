'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAHandler() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [showIOSInstall, setShowIOSInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    addDebugInfo('PWAHandler mounted');
    
    // Enhanced iOS device detection with more comprehensive checks
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
                       /iPhone|iPad|iPod|iOS/.test(navigator.userAgent);
    
    const isInStandaloneMode = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as { standalone?: boolean }).standalone === true;
    
    setIsIOS(isIOSDevice);
    addDebugInfo(`Device: ${isIOSDevice ? 'iOS' : 'Non-iOS'}`);
    addDebugInfo(`User Agent: ${navigator.userAgent}`);
    addDebugInfo(`Platform: ${navigator.platform}`);
    addDebugInfo(`Max Touch Points: ${navigator.maxTouchPoints || 'undefined'}`);
    addDebugInfo(`Standalone mode: ${isInStandaloneMode}`);
    addDebugInfo(`iOS WebApp mode: ${isInWebAppiOS}`);
    addDebugInfo(`Should show iOS install: ${isIOSDevice && !isInWebAppiOS && !isInStandaloneMode}`);
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      addDebugInfo('Service Worker supported');
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          addDebugInfo(`Service Worker registered: ${registration.scope}`);
          console.log('Service Worker registered successfully:', registration.scope);
          
          // Check for updates immediately
          registration.update();
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            addDebugInfo('New service worker found, installing...');
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                addDebugInfo(`New worker state: ${newWorker.state}`);
                
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content is available, show update prompt
                    addDebugInfo('New version available - showing update prompt');
                    const shouldUpdate = confirm(
                      'New version available! Click OK to update and reload the app.'
                    );
                    if (shouldUpdate) {
                      newWorker.postMessage({ action: 'skipWaiting' });
                      window.location.reload();
                    }
                  } else {
                    // No previous version, content is cached for first time
                    addDebugInfo('Content cached for offline use');
                  }
                }
              });
            }
          });

          // Listen for controller change (when new SW takes control)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            addDebugInfo('New service worker activated - reloading');
            window.location.reload();
          });
        })
        .catch((error) => {
          addDebugInfo(`Service Worker registration failed: ${error.message}`);
          console.error('Service Worker registration failed:', error);
        });
    } else {
      addDebugInfo('Service Worker not supported');
      console.log('Service Worker not supported');
    }

    // Check if manifest is available
    fetch('/manifest.json')
      .then(response => {
        if (response.ok) {
          addDebugInfo('Manifest.json is accessible');
          console.log('Manifest.json is accessible');
          return response.json();
        } else {
          addDebugInfo(`Manifest.json not accessible: ${response.status}`);
          console.error('Manifest.json not accessible:', response.status);
          throw new Error(`HTTP ${response.status}`);
        }
      })
      .then(manifest => {
        addDebugInfo(`Manifest loaded: ${manifest.name}`);
        console.log('Manifest content:', manifest);
      })
      .catch(error => {
        addDebugInfo(`Error checking manifest: ${error.message}`);
        console.error('Error checking manifest:', error);
      });

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      addDebugInfo('Install prompt intercepted');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Handle app installed
    const handleAppInstalled = () => {
      addDebugInfo('App installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if app is already installed
    if (isInStandaloneMode || isInWebAppiOS) {
      addDebugInfo('App is running in standalone mode (installed)');
      setIsInstalled(true);
    }

    // For iOS devices, show manual installation instructions since beforeinstallprompt doesn't fire
    if (isIOSDevice && !isInWebAppiOS && !isInStandaloneMode) {
      addDebugInfo('iOS device detected - manual installation available');
      // Small delay to ensure everything is loaded
      setTimeout(() => {
        addDebugInfo('Setting showIOSInstall to true');
        setShowIOSInstall(true);
        addDebugInfo('iOS install prompt should now be visible');
      }, 2000); // Increased delay to 2 seconds for better visibility
    } else {
      addDebugInfo(`iOS install not shown: isIOSDevice=${isIOSDevice}, isInWebAppiOS=${isInWebAppiOS}, isInStandaloneMode=${isInStandaloneMode}`);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Don't render anything if app is already installed and no debug mode
  if (isInstalled && !showDebug) {
    return null;
  }

  return (
    <>
      {/* Install Button for Non-iOS */}
      {isInstallable && !isInstalled && !isIOS && (
        <div className="fixed bottom-4 right-4 z-50">
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
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
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

      {/* Debug Panel Toggle - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg shadow-lg text-sm transition-colors duration-200"
            aria-label="Toggle PWA Debug Info"
          >
            PWA Debug
          </button>
        </div>
      )}

      {/* Debug Panel */}
      {showDebug && (
        <div className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-md max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">PWA Debug Info</h3>
            <button
              onClick={() => setShowDebug(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1 text-xs font-mono">
            {debugInfo.map((info, index) => (
              <div key={index} className="text-gray-700 dark:text-gray-300 break-words">
                {info}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="text-xs space-y-1">
              <div>iOS: {isIOS ? 'Yes' : 'No'}</div>
              <div>Installable: {isInstallable ? 'Yes' : 'No'}</div>
              <div>Installed: {isInstalled ? 'Yes' : 'No'}</div>
              <div>iOS Install: {showIOSInstall ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
