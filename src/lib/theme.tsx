import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_THEME, THEMES, type Theme, type ThemeName } from '../config';

const ThemeContext = createContext<Theme>(THEMES[DEFAULT_THEME]);

export const ThemeProvider = ({ theme = DEFAULT_THEME, children }: { theme?: ThemeName; children: ReactNode }) => (
  <ThemeContext.Provider value={THEMES[theme]}>{children}</ThemeContext.Provider>
);

export const useTheme = (): Theme => useContext(ThemeContext);
