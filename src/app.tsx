import { Capacitor } from '@capacitor/core';
import { NativeNavigation } from '@capgo/capacitor-native-navigation';
import { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { setDirection, setupRouterOutlet } from '@capgo/capacitor-transitions/react';
import Router from "./router";

const NATIVE_TABS = [
  {
    id: 'home',
    title: 'Slap',
    icon: {
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>',
    },
  },
  {
    id: 'settings',
    title: 'Thief',
    icon: {
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    },
  },
] as const;

function getSelectedTabId(pathname: string) {
  if (pathname === '/app') return 'home';
  if (pathname === '/app/settings') return 'settings';
  return undefined;
}

function getTabRoute(id: string) {
  if (id === 'home') return '/app';
  if (id === 'settings') return '/app/settings';
  return undefined;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const outletRef = useRef<HTMLElement>(null);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (outletRef.current) {
      setupRouterOutlet(outletRef.current, { platform: 'auto', swipeGesture: 'auto' });
    }
  }, []);

  useEffect(() => {
    if (!isNative) return;

    void NativeNavigation.configure({
      contentInsetMode: 'css',
    });
  }, [isNative]);

  useEffect(() => {
    if (!isNative) return;

    const syncTabbar = async () => {
      const selectedId = getSelectedTabId(location.pathname);

      await NativeNavigation.setTabbar({
        hidden: !selectedId,
        selectedId,
        labels: true,
        icons: true,
        tabs: [...NATIVE_TABS],
      });
    };

    void syncTabbar();
  }, [isNative, location.pathname]);

  useEffect(() => {
    if (!isNative) return;

    let cancelled = false;

    const setupListeners = async () => {
      const tabHandle = await NativeNavigation.addListener('tabSelect', ({ id }) => {
        const target = getTabRoute(id);
        if (!target) return;

        setDirection('none');
        navigate(target, { replace: true });
      });

      if (cancelled) {
        await tabHandle.remove();
      }

      return tabHandle;
    };

    let handlePromise = setupListeners();

    return () => {
      cancelled = true;
      void handlePromise.then((handle) => handle?.remove());
    };
  }, [isNative, navigate]);

  return (
    <cap-router-outlet ref={outletRef}>
      <Router location={location} />
    </cap-router-outlet>
  );
}

export default App;
