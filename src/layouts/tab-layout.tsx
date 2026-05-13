import { createContext, useContext, useEffect, useState } from "react";
import { Outlet } from "react-router";
import { NativeNavigation } from '@capgo/capacitor-native-navigation';

const TabbarHeightContext = createContext(0);

export function useTabbarHeight() {
  return useContext(TabbarHeightContext);
}

export default function TabLayout() {
  const [tabbarHeight, setTabbarHeight] = useState(0);

  useEffect(() => {
    const listenerPromise = NativeNavigation.addListener('safeAreaChanged', ({ insets }) => {
      setTabbarHeight(insets.tabbarHeight);
    });
    return () => { listenerPromise.then(l => l.remove()); };
  }, []);

  return (
    <TabbarHeightContext.Provider value={tabbarHeight}>
      <Outlet />
    </TabbarHeightContext.Provider>
  );
}
