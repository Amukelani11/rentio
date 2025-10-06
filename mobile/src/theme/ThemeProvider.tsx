import { createContext, ReactNode, useContext, useMemo } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';
import { darkTheme, lightTheme, Theme } from './theme';

const ThemeContext = createContext<Theme>(lightTheme);

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
  overrideScheme?: ColorSchemeName;
}

export function ThemeProvider({ children, overrideScheme }: ThemeProviderProps) {
  const schemeFromDevice = useColorScheme();
  const activeScheme = overrideScheme ?? schemeFromDevice ?? 'light';

  const value = useMemo(() => (activeScheme === 'dark' ? darkTheme : lightTheme), [activeScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
