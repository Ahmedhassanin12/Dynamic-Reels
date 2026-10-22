import { createContext, createElement, useContext, type ReactNode } from 'react';
import { DEFAULT_THEME, THEMES } from './tokens';
import type { Theme, ThemeName } from './types';

export const ThemeContext = createContext<Theme>(THEMES[DEFAULT_THEME]);

export const ThemeProvider = ({
  theme = DEFAULT_THEME,
  children,
}: {
  theme?: ThemeName;
  children: ReactNode;
}) => createElement(ThemeContext.Provider, { value: THEMES[theme] }, children);

export const useTheme = (): Theme => useContext(ThemeContext);
