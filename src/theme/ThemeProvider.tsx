import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { colorsForMode, lightColors, type ThemeColors, type ThemeMode } from './tokens';

type ThemeValue = { mode: ThemeMode; colors: ThemeColors; setMode: (mode: ThemeMode) => void };
const ThemeContext = createContext<ThemeValue>({ mode: 'light', colors: lightColors, setMode: () => {} });

export function ThemeProvider({ children, initialMode = 'light', onModeChange }: PropsWithChildren<{ initialMode?: ThemeMode; onModeChange?: (mode: ThemeMode) => Promise<void> }>) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);
  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void onModeChange?.(next).catch((error) => console.warn('Could not save appearance preference.', error));
  }, [onModeChange]);
  const value = useMemo(() => ({ mode, colors: colorsForMode(mode), setMode }), [mode, setMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
